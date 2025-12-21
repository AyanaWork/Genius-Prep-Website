const express = require('express');
const router = express.Router();
const tutorProfileController = require('../controllers/tutorProfileController');
const auth = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/profile', auth, tutorProfileController.createOrUpdateProfile);
router.get('/profile', auth, tutorProfileController.getMyProfile);
router.patch('/availability', auth, tutorProfileController.toggleAvailability);

// Public routes
router.get('/all', tutorProfileController.getAllTutors);
router.get('/:id', tutorProfileController.getTutorById);

module.exports = router;