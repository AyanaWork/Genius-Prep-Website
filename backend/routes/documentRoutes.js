const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Document library hard cap: 100 MB per file.
// Keep this in sync with MAX_BYTES in controllers/documentController.js
// and the client-side guard in frontend/src/pages/Documents.js.
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES }
});

// Multer aborts the request as soon as the byte cap is hit. Convert that
// into a clean 413 with a friendly message instead of leaking the raw error.
function handleUploadErrors(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Documents must be 100 MB or smaller.',
    });
  }
  if (err) return next(err);
  next();
}

// Authenticated user routes (private library — your uploads only)
router.get('/status', auth, documentController.getMyStatus);
router.get('/my-uploads', auth, documentController.listMyUploads);
router.get('/module-codes', auth, documentController.listModuleCodes);
router.post(
  '/',
  auth,
  (req, res, next) => upload.single('file')(req, res, (err) => handleUploadErrors(err, req, res, next)),
  documentController.upload
);
router.get('/', auth, documentController.list);

// Admin moderation. NOTE: admin paths are mounted BEFORE /:id so that
// "/admin/list" doesn't get captured by the wildcard.
router.get('/admin/list', auth, isAdmin, documentController.adminList);
router.post('/admin/:id/approve', auth, isAdmin, documentController.adminApprove);
router.post('/admin/:id/reject', auth, isAdmin, documentController.adminReject);
router.delete('/admin/:id', auth, isAdmin, documentController.adminDelete);

// Owner-only delete + read (must come AFTER /admin/* routes)
router.delete('/:id', auth, documentController.deleteMyUpload);
router.get('/:id', auth, documentController.getOne);

module.exports = router;