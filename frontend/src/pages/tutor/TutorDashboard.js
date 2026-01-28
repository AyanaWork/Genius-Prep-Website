import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import authService from '../../services/auth';
import TutorBookings from '../../components/bookings/TutorBooking';
import './TutorDashboard.css';

function TutorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, bookings, reviews
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadTutorData();
  }, []);

  const loadTutorData = async () => {
    try {
      setLoading(true);
      const profileResponse = await profileService.getTutorProfile();
      
      if (profileResponse.profile) {
        setProfile(profileResponse.profile);
        
        // Load reviews
        const reviewsResponse = await reviewService.getTutorReviews(profileResponse.profile.id);
        setReviews(reviewsResponse.reviews || []);
        
        // Calculate stats
        const avgRating = profileResponse.profile.average_rating || 0;
        const totalReviews = profileResponse.profile.review_count || 0;
        
        setStats({
          averageRating: parseFloat(avgRating).toFixed(1),
          totalReviews: totalReviews
        });
      }
    } catch (err) {
      console.error('Load tutor data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await profileService.toggleAvailability();
      await loadTutorData();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const currentUser = authService.getCurrentUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
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
              className="text-2xl font-bold text-primary-800 hover:text-primary-900 transition"
            >
              Genius Prep Tuition
            </button>
            
            <div className="flex items-center gap-4">
              {/* Navigation Items */}
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-primary-600 transition font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/gpa')}
                className="text-gray-700 hover:text-primary-600 transition font-medium"
              >
                GPA AI
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                      <span className="text-primary-600 font-semibold text-lg">
                        {currentUser?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.display_name || currentUser?.email}
                      </p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveView('overview');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      📈 Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/tutor/profile/edit');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      ✎ Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('bookings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      🗒 Manage Bookings
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('reviews');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      ★ My Reviews
                    </button>
                    <button
                      onClick={() => {
                        navigate('/gpa');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      ֎ GPA AI
                    </button>
                    <button
                      onClick={() => {
                        if (profile?.id) navigate(`/tutors/${profile.id}`);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      👁 View Public Profile
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        ⍈ Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'bookings' ? (
          <TutorBookings />
        ) : activeView === 'reviews' ? (
          // All Reviews View
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All My Reviews</h2>
              <button
                onClick={() => setActiveView('overview')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-5xl mb-4">✎ᝰ</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Start teaching and students will leave reviews here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start gap-4">
                      {review.student_picture ? (
                        <img
                          src={review.student_picture}
                          alt={review.student_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                          <span className="text-primary-600 font-semibold">
                            {review.student_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{review.student_name}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-2 flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'text-[#60a5fa] fill-current' : 'text-gray-300'}`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                        {review.review_text && (
                          <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !profile ? (
          // No Profile - Welcome Card
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Genius Prep Tuition!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Complete your tutor profile to start accepting students and grow your teaching business.
            </p>
            <button
              onClick={() => navigate('/tutor/profile/edit')}
              className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Create Your Profile
            </button>
          </div>
        ) : (
          // Dashboard Overview
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start justify-between flex-wrap gap-6">
                <div className="flex items-center gap-6">
                  {profile.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.display_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                      <span className="text-primary-600 font-bold text-3xl">
                        {profile.display_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.display_name}</h1>
                    <p className="text-gray-600 mb-3">{currentUser?.email}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(parseFloat(stats.averageRating)) ? 'text-[#60a5fa] fill-current' : 'text-gray-300'}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-600">({stats.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate('/tutor/profile/edit')}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleToggleAvailability}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${
                      profile.availability_status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {profile.availability_status === 'active' ? '✓ Available' : '✗ Unavailable'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#4A90E2] to-[#357ABD] text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{profile.subjects?.length || 0}</div>
                <div className="text-blue-100">Subjects Teaching</div>
              </div>
              <div className="bg-gradient-to-br from-[#3578f6] to-[#245fd1] text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{profile.years_experience || 0}</div>
                <div className="text-blue-100">Years Experience</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">R{profile.hourly_rate || 0}</div>
                <div className="text-green-100">Hourly Rate</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold mb-2">{stats.averageRating}</div>
                <div className="text-yellow-100">Average Rating</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveView('bookings')}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-left"
              >
                <div className="text-3xl mb-3">🗒</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Bookings</h3>
                <p className="text-sm text-gray-600">View and respond to booking requests from students</p>
              </button>
              <button
                onClick={() => setActiveView('reviews')}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-left"
              >
                <div className="text-3xl mb-3">★</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View All Reviews</h3>
                <p className="text-sm text-gray-600">See what students are saying about you</p>
              </button>
              <button
                onClick={() => profile.id && navigate(`/tutors/${profile.id}`)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-left"
              >
                <div className="text-3xl mb-3">👁</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Public Profile</h3>
                <p className="text-sm text-gray-600">Preview how students see your profile</p>
              </button>
            </div>

            {/* Recent Reviews (Preview) */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
                {reviews.length > 3 && (
                  <button
                    onClick={() => setActiveView('reviews')}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View All →
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-5xl mb-4">✎ᝰ</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Start teaching and students will leave reviews here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition">
                      <div className="flex items-start gap-4">
                        {review.student_picture ? (
                          <img
                            src={review.student_picture}
                            alt={review.student_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                            <span className="text-primary-600 font-semibold">
                              {review.student_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{review.student_name}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mb-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-[#60a5fa] fill-current' : 'text-gray-300'}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            ))}
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💡</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Dashboard is Ready!</h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Manage your bookings, update your profile, and track your teaching performance all in one place.
                  </p>
                  <button
                    onClick={() => profile.id && navigate(`/tutors/${profile.id}`)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-sm"
                  >
                    Preview Your Public Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorDashboard;