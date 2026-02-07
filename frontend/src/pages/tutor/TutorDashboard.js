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
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => {
                        navigate('/tutor/profile/edit');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('bookings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      📅 Manage Bookings
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('reviews');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      ⭐ My Reviews
                    </button>
                    <button
                      onClick={() => {
                        navigate('/gpa');
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      🤖 GPA AI
                    </button>
                    <button
                      onClick={() => {
                        if (profile?.id) navigate(`/tutors/${profile.id}`);
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      👁️ View Public Profile
                    </button>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        🚪 Logout
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
                <div className="text-5xl mb-4">⭐</div>
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
            {/* Approval Status Banner */}
            {profile.approval_status && profile.approval_status !== 'approved' && (
              <div className={`p-6 rounded-xl border-l-4 shadow-sm ${
                profile.approval_status === 'rejected' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {profile.approval_status === 'rejected' ? (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold mb-2 ${
                      profile.approval_status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      Profile Status: {profile.approval_status.charAt(0).toUpperCase() + profile.approval_status.slice(1)}
                    </h3>
                    {profile.approval_status === 'pending' && (
                      <div>
                        <p className="text-yellow-800 mb-2">
                          Your profile is currently under review by our admin team. You'll be able to accept bookings once your profile is approved.
                        </p>
                        <p className="text-sm text-yellow-700">
                          This usually takes 24-48 hours. We'll notify you once your profile is approved.
                        </p>
                      </div>
                    )}
                    {profile.approval_status === 'rejected' && (
                      <div>
                        <p className="text-red-800 mb-2">
                          Unfortunately, your profile was not approved at this time.
                        </p>
                        {profile.rejection_reason && (
                          <p className="text-sm text-red-700 bg-red-100 p-3 rounded-lg mt-2">
                            <strong>Reason:</strong> {profile.rejection_reason}
                          </p>
                        )}
                        <button
                          onClick={() => navigate('/tutor/profile/edit')}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Update Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Banner for Approved */}
            {profile.approval_status === 'approved' && (
              <div className="p-6 rounded-xl border-l-4 bg-green-50 border-green-500 shadow-sm">
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-green-800 mb-1">
                      ✅ Profile Approved!
                    </h3>
                    <p className="text-green-700">
                      Your profile is live and you can now accept student bookings. Start teaching!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rest of the dashboard... */}
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
                <div className="text-3xl mb-3">📅</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Bookings</h3>
                <p className="text-sm text-gray-600">View and respond to booking requests from students</p>
              </button>
              <button
                onClick={() => setActiveView('reviews')}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-left"
              >
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">View All Reviews</h3>
                <p className="text-sm text-gray-600">See what students are saying about you</p>
              </button>
              <button
                onClick={() => profile.id && navigate(`/tutors/${profile.id}`)}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition text-left"
              >
                <div className="text-3xl mb-3">👁️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Public Profile</h3>
                <p className="text-sm text-gray-600">Preview how students see your profile</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorDashboard;