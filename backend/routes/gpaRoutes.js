const express = require('express');
const router = express.Router();
const gpaController = require('../controllers/gpaController');
const auth = require('../middleware/auth');

// All GPA routes require authentication
router.use(auth);

// Check subscription status
router.get('/subscription/status', gpaController.checkSubscriptionStatus);

// Create/activate subscription
router.post('/subscription/create', gpaController.createSubscription);

// AI Features (all require active subscription)
router.post('/generate-notes', gpaController.generateNotes);
router.post('/generate-test', gpaController.generateTest);
router.post('/answer-question', gpaController.answerQuestion);
router.post('/analyze-content', gpaController.analyzeContent);

module.exports = router;
