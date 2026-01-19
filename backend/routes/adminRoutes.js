const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// All admin routes require authentication AND admin role
router.use(auth);
router.use(isAdmin);

// Statistics
router.get('/stats', adminController.getStats);

// Users management
router.get('/users', adminController.getAllUsers);

// Tutors management
router.get('/tutors', adminController.getAllTutors);
router.patch('/tutors/:tutorId/elite', adminController.toggleTutorElite);

// Subscriptions management
router.get('/subscriptions', adminController.getAllSubscriptions);
router.post('/subscriptions/activate', adminController.activateSubscription);

module.exports = router;