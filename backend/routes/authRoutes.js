const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiters');

// Public routes (rate-limited to discourage brute-force / spam)
router.post('/register', registerLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected route
router.get('/me', auth, authController.getMe);

module.exports = router;
