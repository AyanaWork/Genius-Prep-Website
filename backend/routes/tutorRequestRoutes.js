const express = require('express');
const router = express.Router();
const tutorRequestController = require('../controllers/tutorRequestController');
const { publicFormLimiter } = require('../middleware/rateLimiters');

// Public submission — rate-limited to discourage spam.
router.post('/', publicFormLimiter, tutorRequestController.createRequest);

module.exports = router;
