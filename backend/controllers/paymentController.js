const crypto = require('crypto');
const pool = require('../config/database');

// PayFast Configuration
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID,
  merchant_key: process.env.PAYFAST_MERCHANT_KEY,
  passphrase: process.env.PAYFAST_PASSPHRASE,
  sandbox: process.env.NODE_ENV !== 'production'
};

// Generate payment signature
function generateSignature(data, passPhrase = null) {
  const sortedKeys = Object.keys(data).sort();
  
  let pfOutput = '';
  sortedKeys.forEach(key => {
    if (key !== 'signature' && data[key] !== '' && data[key] !== null && data[key] !== undefined) {
      pfOutput += `${key}=${encodeURIComponent(String(data[key]).trim())}&`;
    }
  });

  pfOutput = pfOutput.slice(0, -1);
  
  if (passPhrase && passPhrase.trim() !== '') {
    pfOutput += `&passphrase=${encodeURIComponent(passPhrase.trim())}`;
  }

  console.log('Full signature string:', pfOutput);
  
  return crypto.createHash('md5').update(pfOutput).digest('hex');
}

// Generate payment for GPA subscription
exports.generatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionType } = req.body;

    // Validate subscription type
    if (!subscriptionType || !['annual', 'semester', 'monthly', 'daily'].includes(subscriptionType)) {
      return res.status(400).json({ 
        error: 'Invalid subscription type. Must be "annual", "semester", "monthly", or "daily"' 
      });
    }

    // Set amount based on subscription type
    const amountMap = { annual: 700, semester: 450, monthly: 250, daily: 100 };
    const amount = amountMap[subscriptionType];

    // Generate unique payment ID
    const paymentId = `GPA_${userId}_${Date.now()}`;

    // Get user email from database
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userEmail = userResult.rows[0].email;

    // Trim and validate credentials
    const merchantId = String(PAYFAST_CONFIG.merchant_id || '').trim().replace(/\s+/g, '');
    const merchantKey = String(PAYFAST_CONFIG.merchant_key || '').trim().replace(/\s+/g, '');
    const passphrase = String(PAYFAST_CONFIG.passphrase || '').trim();

    console.log('PayFast credentials check:', {
      merchantIdLength: merchantId.length,
      merchantKeyLength: merchantKey.length,
      hasPassphrase: !!passphrase
    });

    if (merchantKey.length !== 13) {
      console.error(`CRITICAL: Merchant key is ${merchantKey.length} characters, expected 13. Key: "${merchantKey}"`);
      return res.status(500).json({ 
        error: 'Payment configuration error. Please contact support.',
        details: `Merchant key length: ${merchantKey.length}`
      });
    }

     const durationMap = { annual: '12 months', semester: '6 months', monthly: '1 month', daily: '1 day' };
     const labelMap = { annual: 'Annual', semester: 'Semester', monthly: 'Monthly', daily: 'Daily' };


    console.log('Generating payment for:', {
      userId,
      subscriptionType,
      amount,
      paymentId,
      merchantKeyLength: merchantKey.length
    });

    // Create payment data 
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/notify`,
      name_first: 'GPA',
      name_last: 'Subscription',
      email_address: userEmail,
      m_payment_id: paymentId,
      amount: amount.toFixed(2),
      item_name: `GPA ${labelMap[subscriptionType]} Subscription`,
      item_description: `Genius Prep Accelerator - ${durationMap[subscriptionType]} unlimited access`,
      custom_int1: String(userId),
      custom_str1: 'gpa_subscription',
      custom_str2: subscriptionType
    };
    
    console.log('Payment data before signature:', paymentData);

    console.log('Passphrase being used:', JSON.stringify(process.env.PAYFAST_PASSPHRASE));
    console.log('Passphrase length:', process.env.PAYFAST_PASSPHRASE?.length);
    
    // Generate signature
    const signature = generateSignature(paymentData, process.env.PAYFAST_PASSPHRASE);
    paymentData.signature = signature;
    
    console.log('Generated signature:', signature);
    
    // Delete existing pending payment first, then insert new one
    await pool.query('DELETE FROM payment_pending WHERE user_id = $1', [userId]);
    
    await pool.query(`
      INSERT INTO payment_pending (user_id, payment_id, subscription_type, amount)
      VALUES ($1, $2, $3, $4)
    `, [userId, paymentId, subscriptionType, amount]);
    
    // Return payment data for frontend
    res.json({
      success: true,
      paymentData,
      paymentUrl: process.env.PAYFAST_MODE === 'live'
      ? 'https://www.payfast.co.za/eng/process'        
      : 'https://sandbox.payfast.co.za/eng/process'   
    });

  } catch (error) {
    console.error('Generate payment error:', error);
    res.status(500).json({ 
      error: 'Failed to generate payment',
      details: error.message 
    });
  }
};

// Payment notification handler (webhook from PayFast)
exports.handleNotification = async (req, res) => {
  try {
    const data = req.body;
    console.log('PayFast notification received:', data);

    // Verify signature
    const signature = data.signature;
    delete data.signature;
    
    const calculatedSignature = generateSignature(data, PAYFAST_CONFIG.passphrase);
    
    if (signature !== calculatedSignature) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    // Get payment info
    const paymentId = data.m_payment_id;
    const paymentStatus = data.payment_status;

    if (paymentStatus === 'COMPLETE') {
      // Get pending payment info
      const pendingResult = await pool.query(
        `SELECT * FROM payment_pending WHERE payment_id = $1`,
        [paymentId]
      );

      if (pendingResult.rows.length === 0) {
        console.error('Pending payment not found');
        return res.status(404).send('Payment not found');
      }

      const pending = pendingResult.rows[0];
      const userId = pending.user_id;
      const subscriptionType = pending.subscription_type;
      const amount = pending.amount;

      // Create subscription
      const startDate = new Date();
      const endDate = new Date();
      
      if (subscriptionType === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (subscriptionType === 'semester') {
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (subscriptionType === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscriptionType === 'daily') {
        endDate.setDate(endDate.getDate() + 1);
      }

      await pool.query(`
        INSERT INTO gpa_subscriptions 
        (user_id, subscription_type, amount, start_date, end_date, payment_reference, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (user_id) DO UPDATE SET
          subscription_type = $2,
          amount = $3,
          start_date = $4,
          end_date = $5,
          payment_reference = $6,
          is_active = true
      `, [userId, subscriptionType, amount, startDate, endDate, paymentId]);

      // Delete pending payment
      await pool.query('DELETE FROM payment_pending WHERE payment_id = $1', [paymentId]);

      console.log('Subscription activated for user:', userId);
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('Error processing payment');
  }
};

// Check payment status
exports.checkStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    // Check if subscription was created
    const subResult = await pool.query(
      `SELECT * FROM gpa_subscriptions WHERE user_id = $1 AND payment_reference = $2`,
      [userId, paymentId]
    );

    if (subResult.rows.length > 0) {
      return res.json({
        status: 'completed',
        subscription: subResult.rows[0]
      });
    }

    // Check if still pending
    const pendingResult = await pool.query(
      `SELECT * FROM payment_pending WHERE user_id = $1 AND payment_id = $2`,
      [userId, paymentId]
    );

    if (pendingResult.rows.length > 0) {
      return res.json({
        status: 'pending',
        payment: pendingResult.rows[0]
      });
    }

    res.json({
      status: 'not_found'
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

// Create payment for tutor booking
exports.createBookingPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.body;

    console.log('Auth userId:', userId, 'BookingId:', bookingId, 'Type:', typeof userId, typeof bookingId);
    console.log('Creating booking payment for:', { userId, bookingId });

    // Get booking details
    const bookingQuery = `
      SELECT 
        b.*,
        u.email as student_email,
        tp.display_name as tutor_name,
        tp.hourly_rate
      FROM bookings b
      JOIN users u ON b.student_id = u.id
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.user_id
      WHERE b.id = $1 AND b.student_id = $2
    `;

    const bookingResult = await pool.query(bookingQuery, [bookingId, userId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const booking = bookingResult.rows[0];

    // Validate booking can be paid
    if (booking.status !== 'accepted') {
      return res.status(400).json({ 
        error: 'Booking must be accepted by tutor before payment' 
      });
    }

    if (booking.payment_status === 'completed' || booking.payment_status === 'paid') {
      return res.status(400).json({ 
        error: 'Booking has already been paid' 
      });
    }

    const amount = booking.total_amount || (booking.number_of_hours * booking.hourly_rate);
    const paymentId = `BOOKING_${bookingId}_${Date.now()}`;

    console.log('Payment details:', {
      amount,
      paymentId,
      tutorName: booking.tutor_name,
      hours: booking.number_of_hours
    });

    // Trim credentials
    const merchantId = String(process.env.PAYFAST_MERCHANT_ID || '').trim().replace(/\s+/g, '');
    const merchantKey = String(process.env.PAYFAST_MERCHANT_KEY || '').trim().replace(/\s+/g, '');
    const passphrase = String(process.env.PAYFAST_PASSPHRASE || '').trim();

    console.log('PayFast credentials check:', {
      merchantIdLength: merchantId.length,
      merchantKeyLength: merchantKey.length,
      hasPassphrase: !!passphrase
    });

    if (merchantKey.length !== 13) {
      console.error(`CRITICAL: Merchant key is ${merchantKey.length} characters, expected 13. Key: "${merchantKey}"`);
      return res.status(500).json({ 
        error: 'Payment configuration error. Please contact support.',
        details: `Merchant key length: ${merchantKey.length}`
      });
    }

    // Create payment data 
    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/notify-booking`,
      name_first: 'Tutor',
      name_last: 'Booking',
      email_address: booking.student_email,
      m_payment_id: paymentId,
      amount: parseFloat(amount).toFixed(2),
      item_name: `Tutoring: ${booking.subject}`,
      item_description: `${booking.number_of_hours} hours with ${booking.tutor_name || 'tutor'}`,
      custom_int1: String(userId),
      custom_int2: String(bookingId),
      custom_str1: 'tutor_booking'
    };

    console.log('Payment data before signature:', paymentData);

    // Generate signature
    const signature = generateSignature(paymentData, passphrase);
    paymentData.signature = signature;

    console.log('Generated signature:', signature);

    // Store pending payment
    await pool.query('DELETE FROM payment_pending WHERE user_id = $1', [userId]);
    
    await pool.query(`
      INSERT INTO payment_pending (user_id, payment_id, subscription_type, amount)
      VALUES ($1, $2, $3, $4)
    `, [userId, paymentId, 'booking', amount]);

    // Return payment data
    res.json({
      success: true,
      paymentData,
      paymentUrl: process.env.PAYFAST_MODE === 'live'
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process'
    });

  } catch (error) {
    console.error('Create booking payment error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment',
      details: error.message 
    });
  }
};

// Handle booking payment notification
exports.handleBookingNotification = async (req, res) => {
  try {
    const data = req.body;
    console.log('Booking payment notification received:', data);

    // Verify signature
    const signature = data.signature;
    delete data.signature;
    
    const calculatedSignature = generateSignature(data, process.env.PAYFAST_PASSPHRASE.trim());
    
    if (signature !== calculatedSignature) {
      console.error('Invalid signature for booking payment');
      return res.status(400).send('Invalid signature');
    }

    const paymentId = data.m_payment_id;
    const paymentStatus = data.payment_status;

    if (paymentStatus === 'COMPLETE') {
      const bookingId = parseInt(data.custom_int2);

      console.log('Updating booking payment status:', { bookingId, paymentId });

      // Update booking payment status
      await pool.query(`
        UPDATE bookings 
        SET payment_status = 'completed',
            payment_id = $1
        WHERE id = $2
      `, [paymentId, bookingId]);

      // Delete pending payment
      await pool.query('DELETE FROM payment_pending WHERE payment_id = $1', [paymentId]);

      console.log('Booking payment completed:', bookingId);
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Booking payment notification error:', error);
    res.status(500).send('Error processing payment');
  }
};

module.exports = exports;