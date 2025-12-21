const express = require('express');
const router = express.Router();
const studentProfileController = require('../controllers/studentProfileController');
const auth = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/profile', auth, studentProfileController.createOrUpdateProfile);
router.get('/profile', auth, studentProfileController.getMyProfile);

module.exports = router;