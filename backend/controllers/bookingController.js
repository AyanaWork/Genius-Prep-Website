const Booking = require('../models/Booking');
const StudentProfile = require('../models/StudentProfile');
const TutorProfile = require('../models/TutorProfile');
const pool = require('../config/database');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      tutorId, 
      subject, 
      message, 
      preferredDate, 
      preferredTime,
      numberOfHours,  // NEW
      totalAmount     // NEW
    } = req.body;

    // Validation
    if (!tutorId || !subject) {
      return res.status(400).json({
        error: 'Tutor ID and subject are required'
      });
    }

    // Validate minimum hours
    if (!numberOfHours || numberOfHours < 3) {
      return res.status(400).json({
        error: 'Minimum booking is 3 hours'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid total amount'
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found. Please complete your profile first.'
      });
    }

    // Check if tutor exists
    const tutorProfile = await TutorProfile.findById(tutorId);
    if (!tutorProfile) {
      return res.status(404).json({
        error: 'Tutor not found'
      });
    }

    // Check if tutor is available
    if (tutorProfile.availability_status !== 'active') {
      return res.status(400).json({
        error: 'This tutor is currently unavailable'
      });
    }

    // Verify total amount calculation
    const calculatedTotal = (numberOfHours * tutorProfile.hourly_rate).toFixed(2);
    if (parseFloat(totalAmount) !== parseFloat(calculatedTotal)) {
      return res.status(400).json({
        error: 'Total amount does not match hourly rate × number of hours'
      });
    }

    // Check for existing pending booking
    const existingBooking = await Booking.checkExistingPending(
      studentProfile.id,
      tutorId
    );

    if (existingBooking) {
      return res.status(400).json({
        error: 'You already have a pending booking request with this tutor'
      });
    }

    // Create booking in database with new fields
    const bookingResult = await pool.query(`
      INSERT INTO bookings (
        student_id, 
        tutor_id, 
        subject, 
        message, 
        preferred_date, 
        preferred_time,
        number_of_hours,
        total_amount,
        payment_status,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'pending')
      RETURNING *
    `, [
      studentProfile.id,
      tutorId,
      subject,
      message || null,
      preferredDate || null,
      preferredTime || null,
      numberOfHours,
      totalAmount
    ]);

    const booking = bookingResult.rows[0];

    // Get user info for payment
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get student name from profile
    const studentName = studentProfile.display_name || 'Student';
    const studentNames = studentName.split(' ');
    const firstName = studentNames[0] || 'Student';
    const lastName = studentNames.slice(1).join(' ') || 'User';

    // Create PayFast payment
    const PayFastUtils = require('../utils/payfastUtils');
    
    const paymentData = PayFastUtils.createPaymentData(
      {
        merchantId: process.env.PAYFAST_MERCHANT_ID,
        merchantKey: process.env.PAYFAST_MERCHANT_KEY,
        passphrase: process.env.PAYFAST_PASSPHRASE,
        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
        notifyUrl: `${process.env.BACKEND_URL}/api/payments/notify`
      },
      {
        paymentId: PayFastUtils.generatePaymentId(userId, 'BOOKING'),
        userId: userId,
        amount: totalAmount,
        itemName: `Tutoring Session - ${subject}`,
        itemDescription: `${numberOfHours} hours with ${tutorProfile.display_name || 'tutor'}`,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        type: 'booking',
        customInt1: booking.id // Store booking ID for later reference
      }
    );

    const payfastUrl = process.env.PAYFAST_MODE === 'sandbox'
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    res.status(201).json({
      message: 'Booking created successfully. Please complete payment.',
      booking,
      payment: {
        url: payfastUrl,
        data: paymentData
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking request' });
  }
};

// Get student's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found'
      });
    }

    const bookings = await Booking.findByStudentId(studentProfile.id);

    res.json({ bookings });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get tutor's booking requests
exports.getTutorBookings = async (req, res) => {
  try {
    const userId = req.userId;

    const tutorProfile = await TutorProfile.findByUserId(userId);
    if (!tutorProfile) {
      return res.status(404).json({
        error: 'Tutor profile not found'
      });
    }

    const bookings = await Booking.findByTutorId(tutorProfile.id);
    const stats = await Booking.getTutorStats(tutorProfile.id);

    res.json({ bookings, stats });

  } catch (error) {
    console.error('Get tutor bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch booking requests' });
  }
};

// Update booking status (tutor only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['accepted', 'declined', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: accepted, declined, completed, or cancelled'
      });
    }

    // Get tutor profile
    const tutorProfile = await TutorProfile.findByUserId(userId);
    if (!tutorProfile) {
      return res.status(404).json({
        error: 'Tutor profile not found'
      });
    }

    // Update booking
    const booking = await Booking.updateStatus(bookingId, status, tutorProfile.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or you don\'t have permission to update it'
      });
    }

    res.json({
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
};

// Cancel booking (student only)
exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { bookingId } = req.params;

    // Get student profile
    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found'
      });
    }

    // Delete booking
    const booking = await Booking.delete(bookingId, studentProfile.id);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found or already processed'
      });
    }

    res.json({
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Get single booking details
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    res.json({ booking });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

module.exports = exports;