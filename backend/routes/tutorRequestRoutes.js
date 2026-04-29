const express = require('express');
const router = express.Router();
const tutorRequestController = require('../controllers/tutorRequestController');
const auth = require('../middleware/auth');
const { publicFormLimiter } = require('../middleware/rateLimiters');

// Public submission — rate-limited to discourage spam.
router.post('/', publicFormLimiter, tutorRequestController.createRequest);

// Authenticated student routes — see and track your own requests.
router.get('/my', auth, tutorRequestController.listMyRequests);
router.get('/my/:id', auth, tutorRequestController.getMyRequest);

module.exports = router;
