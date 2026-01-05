import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import StarRating from '../../components/common/StarRating';

function TutorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: '0.0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'tutor') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await profileService.getTutorProfile();
      setProfile(response.profile);
      // Load reviews if profile exists
      if (response.profile?.id) {
        loadReviews(response.profile.id);
      }
    } catch (err) {
      console.log('No profile found');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (tutorId) => {
    try {
      const response = await reviewService.getTutorReviews(tutorId);
      setReviews(response.reviews || []);
      setStats(response.stats || { totalReviews: 0, averageRating: '0.0' });
    } catch (err) {
      console.log('Failed to load reviews');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleToggleAvailability = async () => {
    try {
      await profileService.toggleAvailability();
      await loadProfile();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-800">Genius Prep - Tutor</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!profile ? (
          /* No Profile - Welcome Card */
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Genius Prep!</h2>
            <p className="text-gray-600 mb-6">
              Complete your profile to start connecting with students and offering your tutoring services.
            </p>
            <button
              onClick={() => navigate('/tutor/profile/edit')}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-md"
            >
              Complete Your Profile
            </button>
          </div>
        ) : (
          /* Profile Exists - Dashboard */
          <div className="space-y-8">
            {/* Profile Overview Card */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start justify-between">
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
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-900">{profile.display_name}</h2>
                      {profile.is_elite && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                          ⭐ Elite
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{user?.email}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={parseFloat(stats.averageRating)} size="medium" />
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
                    {profile.availability_status === 'active' ? '🟢 Available' : '🔴 Unavailable'}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">{profile.subjects?.length || 0}</div>
                <div className="text-primary-100">Subjects Teaching</div>
              </div>

              <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">{profile.years_experience || 0}</div>
                <div className="text-secondary-100">Years Experience</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">R{profile.hourly_rate || 0}</div>
                <div className="text-green-100">Hourly Rate</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
                <div className="text-4xl font-bold mb-2">{stats.averageRating}</div>
                <div className="text-yellow-100">Average Rating</div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
                {profile.id && (
                  <button
                    onClick={() => navigate(`/tutors/${profile.id}`)}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Public Profile →
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600">
                    Start teaching and students will leave reviews here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
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
                          <div className="mb-2">
                            <StarRating rating={review.rating} size="small" />
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 3 && (
                    <button
                      onClick={() => navigate(`/tutors/${profile.id}`)}
                      className="w-full py-3 text-center text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all {reviews.length} reviews →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Your Dashboard is Coming Together!
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    Booking management, student messaging, and earnings tracking will be available soon.
                    For now, students can view your profile and request tutoring sessions.
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