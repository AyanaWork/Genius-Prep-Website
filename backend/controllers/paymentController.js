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
  let pfOutput = '';
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      if (data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    }
  }
  
  let getString = pfOutput.slice(0, -1);
  if (passPhrase !== null) {
    getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, '+')}`;
  }
  
  return crypto.createHash('md5').update(getString).digest('hex');
}

// Generate payment form data
exports.generatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionType } = req.body;
    
    // Validate subscription type
    if (!['annual', 'semester'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }
    
    // Set amount based on subscription type
    const amount = subscriptionType === 'annual' ? 700 : 450;
    
    // Generate unique payment ID
    const paymentId = `GPA_${userId}_${Date.now()}`;
    
    // Create payment data
    const paymentData = {
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payments/notify`,
      name_first: 'GPA',
      name_last: 'Subscription',
      email_address: req.userEmail || 'noreply@geniuspreptuition.co.za',
      m_payment_id: paymentId,
      amount: amount.toFixed(2),
      item_name: `GPA ${subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)} Subscription`,
      item_description: `Genius Prep Accelerator - ${subscriptionType === 'annual' ? '12 months' : '6 months'} access`,
      custom_str1: userId.toString(),
      custom_str2: subscriptionType
    };
    
    // Generate signature
    const signature = generateSignature(paymentData, PAYFAST_CONFIG.passphrase);
    paymentData.signature = signature;
    
    // Store pending payment in database
    await pool.query(`
      INSERT INTO payment_pending (user_id, payment_id, subscription_type, amount)
      VALUES ($1, $2, $3, $4)
    `, [userId, paymentId, subscriptionType, amount]);
    
    // Return payment data for frontend
    res.json({
      paymentData,
      paymentUrl: PAYFAST_CONFIG.sandbox 
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process'
    });
    
  } catch (error) {
    console.error('Generate payment error:', error);
    res.status(500).json({ error: 'Failed to generate payment' });
  }
};

// Handle PayFast notification (webhook)
exports.handleNotification = async (req, res) => {
  try {
    const data = req.body;
    
    // Verify signature
    const signature = data.signature;
    delete data.signature;
    const generatedSignature = generateSignature(data, PAYFAST_CONFIG.passphrase);
    
    if (signature !== generatedSignature) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }
    
    // Check payment status
    if (data.payment_status === 'COMPLETE') {
      const userId = parseInt(data.custom_str1);
      const subscriptionType = data.custom_str2;
      const paymentId = data.m_payment_id;
      const amount = parseFloat(data.amount_gross);
      
      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (subscriptionType === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 6);
      }
      
      // Create subscription
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
      
      console.log(`Subscription activated for user ${userId}`);
    }
    
    res.status(200).send('OK');
    
  } catch (error) {
    console.error('Payment notification error:', error);
    res.status(500).send('Error processing payment');
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentId } = req.params;
    
    // Check if payment is complete (subscription created)
    const subscription = await pool.query(`
      SELECT * FROM gpa_subscriptions 
      WHERE user_id = $1 AND payment_reference = $2
    `, [userId, paymentId]);
    
    if (subscription.rows.length > 0) {
      return res.json({ 
        status: 'complete',
        subscription: subscription.rows[0]
      });
    }
    
    // Check if payment is still pending
    const pending = await pool.query(`
      SELECT * FROM payment_pending WHERE user_id = $1 AND payment_id = $2
    `, [userId, paymentId]);
    
    if (pending.rows.length > 0) {
      return res.json({ status: 'pending' });
    }
    
    res.json({ status: 'not_found' });
    
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

module.exports = exports;
