const Booking = require('../models/Booking');
const StudentProfile = require('../models/StudentProfile');
const TutorProfile = require('../models/TutorProfile');

// Create a new booking request
exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { tutorId, subject, message, preferredDate, preferredTime } = req.body;

    // Validation
    if (!tutorId || !subject) {
      return res.status(400).json({
        error: 'Tutor ID and subject are required'
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

    // Create booking
    const booking = await Booking.create({
      studentId: studentProfile.id,
      tutorId,
      subject,
      message,
      preferredDate,
      preferredTime
    });

    res.status(201).json({
      message: 'Booking request sent successfully',
      booking
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