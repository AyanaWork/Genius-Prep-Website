import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';

function ReviewForm({ tutorId, existingReview, onSubmit, onCancel }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.review_text || '');
    }
  }, [existingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        tutorId,
        rating,
        reviewText: reviewText.trim() || null
      });

      // Reset form if not editing
      if (!existingReview) {
        setRating(0);
        setReviewText('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="large"
            interactive={true}
          />
          {rating > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {rating === 5 && '⭐ Excellent!'}
              {rating === 4 && '👍 Very Good'}
              {rating === 3 && '👌 Good'}
              {rating === 2 && '😐 Could be better'}
              {rating === 1 && '👎 Needs improvement'}
            </p>
          )}
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
            placeholder="Share your experience with this tutor... What did you like? How did they help you?"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Help others by sharing your experience
            </p>
            <p className="text-xs text-gray-500">
              {reviewText.length}/500
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;