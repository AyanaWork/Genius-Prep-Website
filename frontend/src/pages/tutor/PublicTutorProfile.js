import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import authService from '../../services/auth';
import StarRating from '../../components/common/StarRating';
import ReviewsList from '../../components/reviews/ReviewsList';
import ReviewForm from '../../components/reviews/ReviewForm';

function PublicTutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [canReview, setCanReview] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser?.role === 'student';

  useEffect(() => {
    loadTutorProfile();
    if (isStudent) {
      checkCanReview();
    }
  }, [id]);

  const loadTutorProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getTutorById(id);
      setTutor(response.profile);
    } catch (err) {
      setError('Failed to load tutor profile');
      console.error('Load tutor error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    try {
      const response = await reviewService.canReview(id);
      setCanReview(response.canReview);
      if (response.existingReview) {
        setEditingReview(response.existingReview);
      }
    } catch (err) {
      console.error('Check can review error:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, reviewData);
      } else {
        await reviewService.createReview(reviewData);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      await loadTutorProfile();
      await checkCanReview();
    } catch (err) {
      throw err;
    }
  };

  const handleRequestTutor = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // For now, show alert - you'll build booking system later
    alert('Booking system coming soon! For now, contact the tutor directly.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading tutor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutor Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This tutor profile does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-800"
            >
              Genius Prep Tuition
            </button>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <button
                  onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Tutor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                {tutor.profile_picture_url ? (
                  <img
                    src={tutor.profile_picture_url}
                    alt={tutor.display_name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                    <span className="text-primary-600 font-bold text-4xl">
                      {tutor.display_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Elite Badge */}
                {tutor.is_elite && (
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Elite Tutor
                  </div>
                )}
              </div>

              {/* Name and Rating */}
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {tutor.display_name}
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-6">
                <StarRating rating={parseFloat(tutor.average_rating || 0)} size="medium" />
                <span className="text-sm text-gray-600">
                  ({tutor.review_count || 0} reviews)
                </span>
              </div>

              {/* Availability Status */}
              <div className="mb-6 text-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  tutor.availability_status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    tutor.availability_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  {tutor.availability_status === 'active' ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {tutor.years_experience || 0}
                  </div>
                  <div className="text-xs text-gray-600">Years Experience</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    R{tutor.hourly_rate || 0}
                  </div>
                  <div className="text-xs text-gray-600">Per Hour</div>
                </div>
              </div>

              {/* Request Button */}
              <button
                onClick={handleRequestTutor}
                disabled={tutor.availability_status !== 'active'}
                className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Tutor
              </button>

              {/* Review Button for Students */}
              {isStudent && canReview && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mt-3 py-3 px-6 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
                >
                  {editingReview ? 'Edit Your Review' : 'Write a Review'}
                </button>
              )}
            </div>
          </div>

          {/* Right Content - Details & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {tutor.bio || 'No bio available.'}
              </p>
            </div>

            {/* Qualifications */}
            {tutor.qualifications && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tutor.qualifications}
                </p>
              </div>
            )}

            {/* Subjects */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Subjects Taught</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects && tutor.subjects.length > 0 ? (
                  tutor.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium border border-primary-200"
                    >
                      {subject}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No subjects listed</p>
                )}
              </div>
            </div>

            {/* Module Codes */}
            {tutor.module_codes && tutor.module_codes.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">University Modules</h2>
                <div className="flex flex-wrap gap-2">
                  {tutor.module_codes.map((code, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg font-mono font-semibold border border-secondary-200"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && isStudent && (
              <ReviewForm
                tutorId={parseInt(id)}
                existingReview={editingReview}
                onSubmit={handleReviewSubmit}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            )}

            {/* Reviews Section */}
            <ReviewsList
              tutorId={parseInt(id)}
              showForm={(review) => {
                setEditingReview(review);
                setShowReviewForm(true);
              }}
              onReviewSubmitted={() => {
                loadTutorProfile();
                checkCanReview();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicTutorProfile;