const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// Generate payment (protected - requires login)
router.post('/generate', auth, paymentController.generatePayment);

// PayFast notification webhook (public - called by PayFast)
router.post('/notify', paymentController.handleNotification);

// Check payment status (protected)
router.get('/status/:paymentId', auth, paymentController.checkPaymentStatus);

module.exports = router;