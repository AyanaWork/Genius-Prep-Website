const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// In-memory upload — files go straight to Supabase storage from the
// controller, so we never write to disk on the API server.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 } // 20 MB; controller also re-checks
});

// ---- Authenticated user routes --------------------------------------
router.get('/status', auth, documentController.getMyStatus);
router.get('/my-uploads', auth, documentController.listMyUploads);
router.get('/module-codes', auth, documentController.listModuleCodes);
router.post('/', auth, upload.single('file'), documentController.upload);
router.get('/', auth, documentController.list);
router.get('/:id', auth, documentController.getOne);

// ---- Admin moderation -----------------------------------------------
router.get('/admin/list', auth, isAdmin, documentController.adminList);
router.post('/admin/:id/approve', auth, isAdmin, documentController.adminApprove);
router.post('/admin/:id/reject', auth, isAdmin, documentController.adminReject);
router.delete('/admin/:id', auth, isAdmin, documentController.adminDelete);

module.exports = router;
