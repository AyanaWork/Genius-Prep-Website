import React, { useState } from 'react';
import StarRating from '../common/StarRating';

function ReviewCard({ review, onEdit, onDelete, isOwnReview }) {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Student Avatar */}
          <div className="relative">
            {review.student_picture ? (
              <img
                src={review.student_picture}
                alt={review.student_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                <span className="text-primary-600 font-semibold text-lg">
                  {review.student_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div>
            <h4 className="font-semibold text-gray-900">{review.student_name}</h4>
            <div className="flex items-center gap-3 mt-1">
              <StarRating rating={review.rating} size="small" />
              <span className="text-sm text-gray-500">
                {formatDate(review.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu (for own reviews) */}
        {isOwnReview && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    onEdit(review);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Edit Review
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this review?')) {
                      onDelete(review.id);
                    }
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Delete Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Text */}
      {review.review_text && (
        <p className="text-gray-700 leading-relaxed">
          {review.review_text}
        </p>
      )}
    </div>
  );
}

export default ReviewCard;