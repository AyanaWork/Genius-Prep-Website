const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Protected routes - Student
router.post('/', auth, bookingController.createBooking);
router.get('/my-bookings', auth, bookingController.getMyBookings);
router.delete('/:bookingId', auth, bookingController.cancelBooking);

// Protected routes - Tutor
router.get('/tutor-bookings', auth, bookingController.getTutorBookings);
router.patch('/:bookingId/status', auth, bookingController.updateBookingStatus);

// Common route
router.get('/:bookingId', auth, bookingController.getBookingById);

module.exports = router;