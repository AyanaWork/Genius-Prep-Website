const Review = require('../models/Review');
const StudentProfile = require('../models/StudentProfile');
const TutorProfile = require('../models/TutorProfile');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { tutorId, rating, reviewText } = req.body;

    // Validation
    if (!tutorId || !rating) {
      return res.status(400).json({
        error: 'Tutor ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      });
    }

    // Get student profile
    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found. Please complete your profile first.'
      });
    }

    // Check if tutor exists
    const tutorProfile = await TutorProfile.findById(tutorId);
    if (!tutorProfile) {
      return res.status(404).json({
        error: 'Tutor not found'
      });
    }

    // Check if student already reviewed this tutor
    const existingReview = await Review.checkExistingReview(
      tutorId,
      studentProfile.id
    );

    if (existingReview) {
      return res.status(400).json({
        error: 'You have already reviewed this tutor. You can edit your existing review.'
      });
    }

    // Create review
    const review = await Review.create({
      tutorId,
      studentId: studentProfile.id,
      rating,
      reviewText: reviewText || null
    });

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get all reviews for a tutor
exports.getTutorReviews = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const reviews = await Review.findByTutorId(tutorId);
    const stats = await Review.getAverageRating(tutorId);

    res.json({
      reviews,
      stats: {
        totalReviews: parseInt(stats.review_count),
        averageRating: parseFloat(stats.average_rating).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get student's own reviews
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.userId;

    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found'
      });
    }

    const reviews = await Review.findByStudentId(studentProfile.id);

    res.json({ reviews });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch your reviews' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    // Get student profile
    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found'
      });
    }

    // Validation
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        error: 'Rating must be between 1 and 5'
      });
    }

    // Update review
    const review = await Review.update(reviewId, studentProfile.id, {
      rating,
      reviewText
    });

    if (!review) {
      return res.status(404).json({
        error: 'Review not found or you don\'t have permission to edit it'
      });
    }

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { reviewId } = req.params;

    // Get student profile
    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.status(404).json({
        error: 'Student profile not found'
      });
    }

    // Delete review
    const review = await Review.delete(reviewId, studentProfile.id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found or you don\'t have permission to delete it'
      });
    }

    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Check if student can review a tutor
exports.canReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { tutorId } = req.params;

    const studentProfile = await StudentProfile.findByUserId(userId);
    if (!studentProfile) {
      return res.json({ canReview: false, reason: 'No profile' });
    }

    const existingReview = await Review.checkExistingReview(
      tutorId,
      studentProfile.id
    );

    if (existingReview) {
      return res.json({
        canReview: false,
        reason: 'Already reviewed',
        existingReview
      });
    }

    res.json({ canReview: true });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({ error: 'Failed to check review status' });
  }
};

module.exports = exports;