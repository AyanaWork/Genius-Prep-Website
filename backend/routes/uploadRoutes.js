const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'), false);
    }
  }
});

// POST /api/upload/image
router.post('/image', auth, upload.single('image'), uploadController.uploadImage);

// DELETE /api/upload/image
router.delete('/image', auth, uploadController.deleteImage);

module.exports = router;