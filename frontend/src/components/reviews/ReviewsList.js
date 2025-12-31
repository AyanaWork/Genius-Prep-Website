import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import reviewService from '../../services/review';
import authService from '../../services/auth';

function ReviewsList({ tutorId, showForm, onReviewSubmitted }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: '0.0' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadReviews();
  }, [tutorId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getTutorReviews(tutorId);
      setReviews(data.reviews || []);
      setStats(data.stats || { totalReviews: 0, averageRating: '0.0' });
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Load reviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId);
      await loadReviews();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleEdit = (review) => {
    if (showForm) {
      showForm(review);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Student Reviews
            </h3>
            <p className="text-gray-600 mt-1">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-primary-600">
                {stats.averageRating}
              </span>
              <svg className="w-8 h-8 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mt-1">Average rating</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Be the first to review this tutor!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwnReview={currentUser?.id === review.student_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReviewsList;