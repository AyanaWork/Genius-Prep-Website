const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/', auth, reviewController.createReview);
router.get('/my-reviews', auth, reviewController.getMyReviews);
router.put('/:reviewId', auth, reviewController.updateReview);
router.delete('/:reviewId', auth, reviewController.deleteReview);
router.get('/can-review/:tutorId', auth, reviewController.canReview);

// Public routes (no authentication required)
router.get('/tutor/:tutorId', reviewController.getTutorReviews);

module.exports = router;