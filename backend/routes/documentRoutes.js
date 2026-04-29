const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Authenticated user routes (private library — your uploads only)
router.get('/status', auth, documentController.getMyStatus);
router.get('/my-uploads', auth, documentController.listMyUploads);
router.get('/module-codes', auth, documentController.listModuleCodes);
router.post('/', auth, upload.single('file'), documentController.upload);
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
