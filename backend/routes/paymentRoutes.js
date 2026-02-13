const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Generate payment (protected - requires login)
router.post('/generate', auth, paymentController.generatePayment);

// Create booking payment
router.post('/booking', auth, paymentController.createBookingPayment);

// PayFast notification webhook (public - called by PayFast)
router.post('/notify', paymentController.handleNotification);
router.post('/notify-booking', paymentController.handleBookingNotification);

// Check payment status (protected)
router.get('/status/:paymentId', auth, paymentController.checkStatus);

module.exports = router;