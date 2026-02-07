const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');
const payfastConfig = require('../config/payfast');
const payfastUtils = require('../utils/payfastUtils');

router.get('/plans', (req, res) => {
  try {
    res.json({
      success: true,
      plans: payfastConfig.subscriptionPlans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

router.post('/gpa/initiate', auth, async (req, res) => {
  try {
    const { subscriptionType } = req.body; // 'BASIC', 'PREMIUM', 'UNLIMITED'
    const userId = req.user.id;
    
    // Validate subscription type
    const plan = payfastConfig.subscriptionPlans[subscriptionType];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }
    
    // Free plan doesn't need payment
    if (subscriptionType === 'FREE') {
      // Activate free subscription directly
      await activateSubscription(userId, 'FREE', null);
      return res.json({
        success: true,
        message: 'Free subscription activated',
        redirect: false
      });
    }
    
    // Get user details
    const userResult = await pool.query(
      'SELECT email, name FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    
    // Create payment record
    const paymentId = payfastUtils.generatePaymentId(userId, 'gpa');
    
    const paymentResult = await pool.query(
      `INSERT INTO payments (user_id, payment_type, amount, status, merchant_payment_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        userId,
        'gpa_subscription',
        plan.price,
        'pending',
        paymentId,
        JSON.stringify({ subscriptionType, planName: plan.name })
      ]
    );
    
    const dbPaymentId = paymentResult.rows[0].id;
    
    // Get PayFast configuration
    const config = payfastConfig.getConfig();
    
    // Create PayFast payment data
    const paymentData = payfastUtils.createPaymentData(config, {
      firstName,
      lastName,
      email: user.email,
      paymentId,
      amount: plan.price,
      itemName: `GPA ${plan.name} Subscription`,
      itemDescription: `${plan.name} plan - ${plan.queries} queries/month`,
      userId,
      type: 'gpa_subscription',
      customInt1: dbPaymentId
    });
    
    // Return payment data for frontend to submit
    res.json({
      success: true,
      paymentData,
      paymentUrl: config.url,
      paymentId: dbPaymentId,
      amount: plan.price,
      planName: plan.name
    });
    
  } catch (error) {
    console.error('Error initiating GPA payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.post('/booking/initiate', auth, async (req, res) => {
  try {
    const { bookingId, tutorId, hours, hourlyRate } = req.body;
    const studentId = req.user.id;
    
    // Validate inputs
    if (!bookingId || !tutorId || !hours || !hourlyRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Calculate total amount
    const totalAmount = parseFloat(hours) * parseFloat(hourlyRate);
    
    // Calculate revenue split
    const split = payfastConfig.commission.calculateSplit(totalAmount);
    
    // Get user and tutor details
    const userResult = await pool.query(
      `SELECT u.email, u.name, t.name as tutor_name
       FROM users u
       CROSS JOIN (SELECT name FROM users WHERE id = $1) t
       WHERE u.id = $2`,
      [tutorId, studentId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User or tutor not found' });
    }
    
    const user = userResult.rows[0];
    const [firstName, ...lastNameParts] = user.name.split(' ');
    const lastName = lastNameParts.join(' ') || 'User';
    
    // Create payment record
    const paymentId = payfastUtils.generatePaymentId(studentId, 'booking');
    
    const paymentResult = await pool.query(
      `INSERT INTO payments (user_id, payment_type, amount, status, merchant_payment_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        studentId,
        'tutor_booking',
        totalAmount,
        'pending',
        paymentId,
        JSON.stringify({
          bookingId,
          tutorId,
          hours,
          hourlyRate,
          split
        })
      ]
    );
    
    const dbPaymentId = paymentResult.rows[0].id;
    
    // Create tutor earnings record
    await pool.query(
      `INSERT INTO tutor_earnings 
       (tutor_id, booking_id, payment_id, total_amount, tutor_amount, company_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        tutorId,
        bookingId,
        dbPaymentId,
        split.total,
        split.tutorAmount,
        split.companyAmount,
        'pending'
      ]
    );
    
    // Get PayFast configuration
    const config = payfastConfig.getConfig();
    
    // Create PayFast payment data
    const paymentData = payfastUtils.createPaymentData(config, {
      firstName,
      lastName,
      email: user.email,
      paymentId,
      amount: totalAmount,
      itemName: `Tutoring Session with ${user.tutor_name}`,
      itemDescription: `${hours} hour(s) @ R${hourlyRate}/hour`,
      userId: studentId,
      type: 'tutor_booking',
      customInt1: dbPaymentId
    });
    
    // Return payment data
    res.json({
      success: true,
      paymentData,
      paymentUrl: config.url,
      paymentId: dbPaymentId,
      amount: totalAmount,
      split
    });
    
  } catch (error) {
    console.error('Error initiating booking payment:', error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.post('/notify', express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
  try {
    console.log('Received PayFast ITN notification');
    
    // Parse ITN data
    const pfData = payfastUtils.parseITNData(req.body.toString());
    console.log('ITN Data:', pfData);
    
    // Get PayFast configuration
    const config = payfastConfig.getConfig();
    
    // 1. Verify the signature
    const signature = pfData.signature;
    delete pfData.signature; // Remove signature before validation
    
    const isValidSignature = payfastUtils.validateSignature(
      pfData,
      config.passphrase,
      signature
    );
    
    if (!isValidSignature) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }
    
    // 2. Verify the payment with PayFast
    const pfHost = config.url.includes('sandbox') ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    const isValidPayment = await payfastUtils.verifyPaymentWithPayFast(pfData, pfHost);
    
    if (!isValidPayment) {
      console.error('Payment validation failed');
      return res.status(400).send('Payment validation failed');
    }
    
    // 3. Check IP address
    const clientIP = payfastUtils.getClientIP(req);
    if (!payfastUtils.isValidPayFastIP(clientIP)) {
      console.error('Invalid IP address:', clientIP);
      return res.status(400).send('Invalid IP');
    }
    
    // 4. Process the payment
    const paymentStatus = pfData.payment_status;
    const dbPaymentId = pfData.custom_int1;
    const paymentType = pfData.custom_str2;
    
    console.log(`Processing payment ${dbPaymentId}, status: ${paymentStatus}, type: ${paymentType}`);
    
    // Update payment record
    await pool.query(
      `UPDATE payments 
       SET status = $1, payfast_payment_id = $2, completed_at = CURRENT_TIMESTAMP,
           metadata = metadata || $3::jsonb
       WHERE id = $4`,
      [
        paymentStatus === 'COMPLETE' ? 'complete' : 'failed',
        pfData.pf_payment_id,
        JSON.stringify({ itn_data: pfData }),
        dbPaymentId
      ]
    );
    
    // Handle successful payment
    if (paymentStatus === 'COMPLETE') {
      if (paymentType === 'gpa_subscription') {
        await handleGPAPaymentSuccess(dbPaymentId);
      } else if (paymentType === 'tutor_booking') {
        await handleBookingPaymentSuccess(dbPaymentId);
      }
    }
    
    // Respond to PayFast
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Error processing ITN:', error);
    res.status(500).send('Error processing notification');
  }
});

router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM payments WHERE id = $1 AND user_id = $2',
      [paymentId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({
      success: true,
      payment: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT id, payment_type, amount, status, created_at, completed_at, metadata
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    
    res.json({
      success: true,
      payments: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

router.get('/tutor/earnings', auth, async (req, res) => {
  try {
    const tutorId = req.user.id;
    
    // Get earnings summary
    const summaryResult = await pool.query(
      `SELECT 
         COUNT(*) as total_bookings,
         SUM(total_amount) as total_earned,
         SUM(tutor_amount) as tutor_earnings,
         SUM(CASE WHEN status = 'pending' THEN tutor_amount ELSE 0 END) as pending_amount,
         SUM(CASE WHEN status = 'paid' THEN tutor_amount ELSE 0 END) as paid_amount
       FROM tutor_earnings
       WHERE tutor_id = $1`,
      [tutorId]
    );
    
    // Get recent earnings
    const earningsResult = await pool.query(
      `SELECT te.*, b.subject, b.created_at as booking_date,
              u.name as student_name
       FROM tutor_earnings te
       JOIN bookings b ON te.booking_id = b.id
       JOIN users u ON b.student_id = u.id
       WHERE te.tutor_id = $1
       ORDER BY te.created_at DESC
       LIMIT 20`,
      [tutorId]
    );
    
    res.json({
      success: true,
      summary: summaryResult.rows[0],
      earnings: earningsResult.rows
    });
    
  } catch (error) {
    console.error('Error fetching tutor earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

async function activateSubscription(userId, subscriptionType, paymentId) {
  const plan = payfastConfig.subscriptionPlans[subscriptionType];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.duration);
  
  await pool.query(
    `INSERT INTO subscriptions (user_id, subscription_type, status, queries_used, queries_limit, end_date, payment_id)
     VALUES ($1, $2, 'active', 0, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       subscription_type = $2,
       status = 'active',
       queries_used = 0,
       queries_limit = $3,
       start_date = CURRENT_TIMESTAMP,
       end_date = $4,
       payment_id = $5`,
    [userId, subscriptionType, plan.queries, endDate, paymentId]
  );
  
  console.log(`Activated ${subscriptionType} subscription for user ${userId}`);
}

async function handleGPAPaymentSuccess(paymentId) {
  const result = await pool.query(
    'SELECT user_id, metadata FROM payments WHERE id = $1',
    [paymentId]
  );
  
  if (result.rows.length > 0) {
    const { user_id, metadata } = result.rows[0];
    const { subscriptionType } = metadata;
    
    await activateSubscription(user_id, subscriptionType, paymentId);
    
    // Track company revenue
    const plan = payfastConfig.subscriptionPlans[subscriptionType];
    await pool.query(
      `INSERT INTO company_revenue (source_type, source_id, amount)
       VALUES ('gpa_subscription', $1, $2)`,
      [paymentId, plan.price]
    );
  }
}

async function handleBookingPaymentSuccess(paymentId) {
  // Update tutor earnings status
  await pool.query(
    `UPDATE tutor_earnings
     SET status = 'complete'
     WHERE payment_id = $1`,
    [paymentId]
  );
  
  // Update booking status
  const result = await pool.query(
    `SELECT te.company_amount, te.booking_id
     FROM tutor_earnings te
     WHERE te.payment_id = $1`,
    [paymentId]
  );
  
  if (result.rows.length > 0) {
    const { company_amount, booking_id } = result.rows[0];
    
    // Update booking
    await pool.query(
      `UPDATE bookings SET status = 'confirmed', payment_status = 'paid'
       WHERE id = $1`,
      [booking_id]
    );
    
    // Track company revenue
    await pool.query(
      `INSERT INTO company_revenue (source_type, source_id, amount)
       VALUES ('booking_commission', $1, $2)`,
      [paymentId, company_amount]
    );
  }
}

module.exports = router;
