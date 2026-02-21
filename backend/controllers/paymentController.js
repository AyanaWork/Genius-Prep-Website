const axios = require('axios');
const pool = require('../config/database');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// initialize a Paystack transaction
async function initializeTransaction(email, amountInRands, metadata, callbackUrl) {
  const amountInKobo = Math.round(amountInRands * 100);

  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amountInKobo,
      currency: 'ZAR',
      callback_url: callbackUrl,
      metadata
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.data;
}

async function verifyTransaction(reference) {
  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    }
  );
  return response.data.data;
}

// ============================================
// GPA SUBSCRIPTION PAYMENT
// ============================================
exports.generatePayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionType } = req.body;

    if (!subscriptionType || !['annual', 'semester', 'monthly', 'daily'].includes(subscriptionType)) {
      return res.status(400).json({
        error: 'Invalid subscription type. Must be "annual", "semester", "monthly", or "daily"'
      });
    }

    const amountMap = { annual: 700, semester: 450, monthly: 250, daily: 100 };
    const amount = amountMap[subscriptionType];
    const paymentId = `GPA_${userId}_${Date.now()}`;

    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userEmail = userResult.rows[0].email;

    console.log('Initializing Paystack GPA payment:', { userId, subscriptionType, amount, paymentId });

    const callbackUrl = `${process.env.FRONTEND_URL}/payment/success?reference=${paymentId}&type=gpa`;

    const transaction = await initializeTransaction(
      userEmail,
      amount,
      {
        payment_id: paymentId,
        user_id: userId,
        subscription_type: subscriptionType,
        payment_type: 'gpa_subscription',
        custom_fields: [
          { display_name: 'Subscription Type', variable_name: 'subscription_type', value: subscriptionType },
          { display_name: 'User ID', variable_name: 'user_id', value: String(userId) }
        ]
      },
      callbackUrl
    );

    await pool.query('DELETE FROM payment_pending WHERE user_id = $1', [userId]);
    await pool.query(
      `INSERT INTO payment_pending (user_id, payment_id, subscription_type, amount)
       VALUES ($1, $2, $3, $4)`,
      [userId, paymentId, subscriptionType, amount]
    );

    console.log('Paystack transaction initialized:', transaction.reference);

    res.json({
      success: true,
      paymentUrl: transaction.authorization_url,
      reference: transaction.reference,
      paymentId
    });

  } catch (error) {
    console.error('Generate payment error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to generate payment',
      details: error.response?.data?.message || error.message
    });
  }
};

// ============================================
// GPA PAYMENT WEBHOOK
// ============================================
exports.handleNotification = async (req, res) => {
  try {
    const event = req.body;
    console.log('Paystack webhook received:', event.event);

    if (event.event === 'charge.success') {
      const data = event.data;
      const metadata = data.metadata;
      const paymentType = metadata?.payment_type;

      if (paymentType === 'gpa_subscription') {
        const paymentId = metadata.payment_id;
        const userId = metadata.user_id;

        const pendingResult = await pool.query(
          'SELECT * FROM payment_pending WHERE payment_id = $1',
          [paymentId]
        );

        if (pendingResult.rows.length === 0) {
          console.error('Pending GPA payment not found:', paymentId);
          return res.status(200).send('OK');
        }

        const pending = pendingResult.rows[0];
        const subscriptionType = pending.subscription_type;
        const amount = pending.amount;

        const startDate = new Date();
        const endDate = new Date();

        if (subscriptionType === 'annual') endDate.setFullYear(endDate.getFullYear() + 1);
        else if (subscriptionType === 'semester') endDate.setMonth(endDate.getMonth() + 6);
        else if (subscriptionType === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
        else if (subscriptionType === 'daily') endDate.setDate(endDate.getDate() + 1);

        await pool.query(
          `INSERT INTO gpa_subscriptions 
           (user_id, subscription_type, amount, start_date, end_date, payment_reference, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           ON CONFLICT (user_id) DO UPDATE SET
             subscription_type = $2,
             amount = $3,
             start_date = $4,
             end_date = $5,
             payment_reference = $6,
             is_active = true`,
          [userId, subscriptionType, amount, startDate, endDate, paymentId]
        );

        await pool.query('DELETE FROM payment_pending WHERE payment_id = $1', [paymentId]);
        console.log('GPA subscription activated for user:', userId);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
};

// ============================================
// BOOKING PAYMENT NOTIFICATION
// ============================================
exports.handleBookingNotification = async (req, res) => {
  try {
    const event = req.body;
    console.log('Paystack booking webhook received:', event.event);

    if (event.event === 'charge.success') {
      const data = event.data;
      const metadata = data.metadata;

      if (metadata?.payment_type === 'tutor_booking') {
        const bookingId = metadata.booking_id;
        const paymentId = metadata.payment_id;

        await pool.query(
          `UPDATE bookings 
           SET payment_status = 'completed', payment_id = $1
           WHERE id = $2`,
          [paymentId, bookingId]
        );

        await pool.query('DELETE FROM payment_pending WHERE payment_id = $1', [paymentId]);
        console.log('Booking payment completed:', bookingId);
      }
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Booking webhook error:', error);
    res.status(200).send('OK');
  }
};

// ============================================
// CHECK PAYMENT STATUS
// ============================================
exports.checkStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.userId;

    const subResult = await pool.query(
      'SELECT * FROM gpa_subscriptions WHERE user_id = $1 AND payment_reference = $2',
      [userId, paymentId]
    );

    if (subResult.rows.length > 0) {
      return res.json({ status: 'completed', subscription: subResult.rows[0] });
    }

    const pendingResult = await pool.query(
      'SELECT * FROM payment_pending WHERE user_id = $1 AND payment_id = $2',
      [userId, paymentId]
    );

    if (pendingResult.rows.length > 0) {
      return res.json({ status: 'pending', payment: pendingResult.rows[0] });
    }

    res.json({ status: 'not_found' });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
};

// ============================================
// BOOKING PAYMENT
// ============================================
exports.createBookingPayment = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.body;

    console.log('Creating booking payment:', { userId, bookingId });

    const bookingResult = await pool.query(
      `SELECT 
        b.*,
        u.email as student_email,
        tp.display_name as tutor_name,
        tp.hourly_rate
       FROM bookings b
       JOIN student_profiles sp ON b.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.id
       WHERE b.id = $1 AND sp.user_id = $2`,
      [bookingId, userId]
    );

    console.log('Booking query rows:', bookingResult.rows.length, 'userId:', userId, 'bookingId:', bookingId);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'accepted') {
      return res.status(400).json({ error: 'Booking must be accepted by tutor before payment' });
    }

    if (booking.payment_status === 'completed' || booking.payment_status === 'paid') {
      return res.status(400).json({ error: 'Booking has already been paid' });
    }

    const amount = parseFloat(booking.total_amount || (booking.number_of_hours * booking.hourly_rate));
    const paymentId = `BOOKING_${bookingId}_${Date.now()}`;

    console.log('Booking payment details:', { amount, paymentId, tutor: booking.tutor_name });

    const callbackUrl = `${process.env.FRONTEND_URL}/payment/success?reference=${paymentId}&type=booking`;

    const transaction = await initializeTransaction(
      booking.student_email,
      amount,
      {
        payment_id: paymentId,
        booking_id: bookingId,
        user_id: userId,
        payment_type: 'tutor_booking',
        custom_fields: [
          { display_name: 'Booking ID', variable_name: 'booking_id', value: String(bookingId) },
          { display_name: 'Subject', variable_name: 'subject', value: booking.subject }
        ]
      },
      callbackUrl
    );

    console.log('Booking Paystack transaction initialized:', transaction.reference);

    res.json({
      success: true,
      paymentUrl: transaction.authorization_url,
      reference: transaction.reference,
      paymentId
    });

  } catch (error) {
    console.error('Create booking payment error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to create payment',
      details: error.response?.data?.message || error.message
    });
  }
};

module.exports = exports;