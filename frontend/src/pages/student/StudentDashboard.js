import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import ai2 from '../../assets/ai2.png';
import books from '../../assets/books.png';
import building from '../../assets/building.png';
import location from '../../assets/location.png';
import magnifier from '../../assets/magnifier.png';
import notepad from '../../assets/notepad.png';
import StarRating from '../../components/common/StarRating';

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadProfile();
    loadMyReviews();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await profileService.getStudentProfile();
      setProfile(response.profile);
    } catch (err) {
      console.log('No profile found');
    } finally {
      setLoading(false);
    }
  };

  const loadMyReviews = async () => {
    try {
      const response = await reviewService.getMyReviews();
      setMyReviews(response.reviews || []);
    } catch (err) {
      console.log('Failed to load reviews');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
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
            <h1 className="text-xl font-bold text-primary-800">Genius Prep - Student</h1>
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
              Complete your profile to start finding tutors and connecting with educational support.
            </p>
            <button
              onClick={() => navigate('/student/profile/edit')}
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
              <div className="flex items-start justify-between mb-6">
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.display_name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        <img src={building} alt="Building" className="w-4 h-4 inline-block mr-2 mb-1" />
                        {profile.education_level}
                      </span>
                      {profile.location && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          <img src={location} alt="Location" className="w-4 h-4 inline-block mr-2 mb-1" />
                          {profile.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/student/profile/edit')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Edit Profile
                </button>
              </div>

              {/* Subjects of Interest */}
              {profile.subjects_interested && profile.subjects_interested.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Subjects of Interest:</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects_interested.map((subject, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium border border-primary-200"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/tutors')}
                className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition"
              >
                <div className="text-4xl mb-3">
                  <img src={magnifier} alt="Find Tutors" className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Find Tutors</h3>
                <p className="text-primary-100">Browse verified tutors in your subjects</p>
              </button>

              <button
                onClick={() => navigate('/tutors')}
                className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition"
              >
                <div className="text-4xl mb-3">
                  <img src={books} alt="My Bookings" className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">My Bookings</h3>
                <p className="text-secondary-100">View your scheduled sessions</p>
                <span className="text-xs text-white/80 mt-2 block">(Coming soon)</span>
              </button>

              <button
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 text-left hover:shadow-xl transition"
              >
                <div className="text-4xl mb-3">
                  <img src={ai2} alt="AI Assistant" className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                <p className="text-purple-100">Get help from GPA</p>
                <span className="text-xs text-white/80 mt-2 block">(Coming soon)</span>
              </button>
            </div>

            {/* My Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
                {myReviews.length > 0 && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {myReviews.length} {myReviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                )}
              </div>

              {myReviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-5xl mb-4">
                    <img src={notepad} alt="notepad" className="w-12 h-12 inline-block" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start working with tutors and share your experience!
                  </p>
                  <button
                    onClick={() => navigate('/tutors')}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    Find a Tutor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition cursor-pointer"
                      onClick={() => navigate(`/tutors/${review.tutor_id}`)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {review.tutor_picture ? (
                            <img
                              src={review.tutor_picture}
                              alt={review.tutor_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                              <span className="text-primary-600 font-semibold">
                                {review.tutor_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.tutor_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} size="small" />
                              <span className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tutors/${review.tutor_id}`);
                          }}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Profile →
                        </button>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                      )}
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
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Getting Started with Genius Prep
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Browse our verified tutors, read reviews from other students, and request tutoring sessions
                    that fit your schedule. Our AI assistant (GPA) will also be available soon to help with
                    study materials and practice tests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;