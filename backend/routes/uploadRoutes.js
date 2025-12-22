const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/image', auth, uploadController.uploadImage);
router.delete('/image', auth, uploadController.deleteImage);

module.exports = router;