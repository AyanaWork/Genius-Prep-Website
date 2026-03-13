const express = require('express');
const router = express.Router();
const adminBookingController = require('../controllers/adminBookingController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// All routes require authentication AND admin role
router.use(auth);
router.use(adminAuth);

// Get all bookings (with filters and search)
router.get('/bookings', adminBookingController.getAllBookings);

// Get booking statistics
router.get('/bookings/stats', adminBookingController.getBookingStats);

// Accept booking on behalf of tutor
router.post('/bookings/:bookingId/accept', adminBookingController.acceptBookingAsAdmin);

// Decline booking on behalf of tutor
router.post('/bookings/:bookingId/decline', adminBookingController.declineBookingAsAdmin);

// Get tutor contact info
router.get('/tutors/:tutorId/contact', adminBookingController.getTutorContact);

module.exports = router;