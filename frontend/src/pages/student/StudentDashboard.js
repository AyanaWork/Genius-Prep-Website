import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import bookingService from '../../services/booking';
import authService from '../../services/auth';
import StudentBookings from '../../components/bookings/StudentBooking';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); 
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const profileResponse = await profileService.getStudentProfile();
      const bookingsResponse = await bookingService.getMyBookings();
      
      setProfile(profileResponse.profile);
      setBookings(bookingsResponse.bookings || []);
    } catch (err) {
      console.error('Load student data error:', err);
    } finally {
      setLoading(false);
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
    <div className="dashboard">
      {/* Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <button 
            onClick={() => navigate('/')}
            className="nav-title cursor-pointer hover:text-primary-700 transition"
          >
            Genius Prep Tuition
          </button>
          
          <div className="flex items-center gap-4">
            {/* Navigation Items - only shows if profile exists */}
            {profile && (
              <>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-primary-600 transition font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/tutors')}
                  className="text-gray-700 hover:text-primary-600 transition font-medium"
                >
                  Browse Tutors
                </button>
                <button
                  onClick={() => navigate('/gpa')}
                  className="text-gray-700 hover:text-primary-600 transition font-medium"
                >
                  GPA AI
                </button>
              </>
            )}
            
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
                    {profile ? (
                      <>
                        <button onClick={() => { setActiveView('overview'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          📈 Dashboard
                        </button>
                        <button onClick={() => { navigate('/student/profile/edit'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          ✏️ Edit Profile
                        </button>
                        <button onClick={() => { setActiveView('bookings'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          📅 My Bookings
                        </button>
                        <button onClick={() => { navigate('/gpa'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                          🤖 GPA AI
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { navigate('/student/profile/edit'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                        ✏️ Create Profile
                      </button>
                    )}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                        🚪 Logout
                      </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="content-container">
          {activeView === 'bookings' ? (
            <StudentBookings />
          ) : !profile ? (
            // No Profile Yet - Show Welcome Card
            <div className="welcome-card">
              <h1 className="welcome-title">Welcome to Genius Prep Tuition!</h1>
              <p className="welcome-text">
                Complete your student profile to start finding the perfect tutors and begin your academic journey.
              </p>
              <button
                onClick={() => navigate('/student/profile/edit')}
                className="btn-primary btn-large"
              >
                Create Your Profile
              </button>
            </div>
          ) : (
            // Has Profile - Show Overview
            <div className="profile-overview">
              {/* Profile Header */}
              <div className="profile-header">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.display_name}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-4xl">
                      {profile.display_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="profile-info">
                  <h2 className="profile-name">{profile.display_name}</h2>
                  <p className="profile-email">{currentUser?.email}</p>
                  <div className="profile-meta">
                    {profile.education_level && (
                      <span className="meta-badge">📚 {profile.education_level}</span>
                    )}
                    {profile.location && (
                      <span className="meta-badge">📍 {profile.location}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-value">{bookings.length}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <div className="stat-label">Pending Requests</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {bookings.filter(b => b.status === 'accepted').length}
                  </div>
                  <div className="stat-label">Accepted Sessions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {bookings.filter(b => b.status === 'completed').length}
                  </div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>

              {/* Subjects Section */}
              {profile.subjects_interested && profile.subjects_interested.length > 0 && (
                <div className="subjects-section">
                  <h3 className="section-title">Subjects of Interest</h3>
                  <div className="subjects-list">
                    {profile.subjects_interested.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="profile-actions">
                <button
                  onClick={() => navigate('/tutors')}
                  className="btn-primary"
                >
                  🔍︎ Find a Tutor
                </button>
                <button
                  onClick={() => setActiveView('bookings')}
                  className="btn-secondary"
                >
                  🗒 View My Bookings
                </button>
                <button
                  onClick={() => navigate('/gpa')}
                  className="btn-secondary"
                >
                  ֎ GPA AI Assistant
                </button>
                <button
                  onClick={() => navigate('/student/profile/edit')}
                  className="btn-secondary"
                >
                  ✎ Edit Profile
                </button>
              </div>

              {/* Info Card */}
              <div className="info-card">
                <p className="info-text">
                  💡 <strong>Quick Tip:</strong> Keep your profile updated to help tutors understand your learning needs better. 
                  Browse our verified tutors and request sessions that fit your schedule!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;