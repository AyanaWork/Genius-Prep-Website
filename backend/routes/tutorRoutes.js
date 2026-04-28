const express = require('express');
const router = express.Router();
const tutorProfileController = require('../controllers/tutorProfileController');
const auth = require('../middleware/auth');
const { searchLimiter } = require('../middleware/rateLimiters');

// Protected routes (require authentication)
router.post('/profile', auth, tutorProfileController.createOrUpdateProfile);
router.get('/profile', auth, tutorProfileController.getMyProfile);
router.patch('/availability', auth, tutorProfileController.toggleAvailability);

// Public discovery routes (rate-limited to discourage scraping)
router.get('/search', searchLimiter, tutorProfileController.searchTutors);
router.get('/module-codes', searchLimiter, tutorProfileController.getDistinctModuleCodes);
router.get('/all', searchLimiter, tutorProfileController.getAllTutors);
router.get('/:id', tutorProfileController.getTutorById);

module.exports = router;
