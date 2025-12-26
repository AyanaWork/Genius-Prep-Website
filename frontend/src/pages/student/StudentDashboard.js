import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import profileService from '../../services/profile';
import './StudentDashboard.css';

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const response = await profileService.getStudentProfile();
      setProfile(response.profile);
    } catch (err) {
      // No profile yet
      console.log('No profile found');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <h1 className="nav-title">Genius Prep - Student</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="content-container">
          {!profile ? (
            <div className="welcome-card">
              <h2 className="welcome-title">Welcome to Genius Prep!</h2>
              <p className="welcome-text">
                Complete your profile to start finding tutors and booking sessions.
              </p>
              <button
                onClick={() => navigate('/student/profile/edit')}
                className="btn-primary btn-large"
              >
                Complete Your Profile
              </button>
            </div>
          ) : (
            <div className="profile-overview">
              <div className="profile-header">
                {profile.profile_picture_url && (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.display_name}
                    className="profile-avatar"
                  />
                )}
                <div className="profile-info">
                  <h2 className="profile-name">{profile.display_name}</h2>
                  <p className="profile-email">{user?.email}</p>
                  <div className="profile-meta">
                    <span className="meta-badge">
                      📚 {profile.education_level || 'Not specified'}
                    </span>
                    {profile.location && (
                      <span className="meta-badge">
                        📍 {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-value">{profile.subjects_interested?.length || 0}</div>
                  <div className="stat-label">Subjects of Interest</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Bookings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">0</div>
                  <div className="stat-label">Saved Tutors</div>
                </div>
              </div>

              {profile.subjects_interested && profile.subjects_interested.length > 0 && (
                <div className="subjects-section">
                  <h3 className="section-title">Subjects You're Interested In</h3>
                  <div className="subjects-list">
                    {profile.subjects_interested.map((subject, index) => (
                      <span key={index} className="subject-tag">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="profile-actions">
                <button
                  onClick={() => navigate('/student/profile/edit')}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/tutors')}
                  className="btn-primary"
                >
                  Find Tutors
                </button>
              </div>

              <div className="info-card">
                <p className="info-text">
                  The student dashboard is under development. 
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