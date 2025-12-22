import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import profileService from '../../services/profile';

function TutorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const handleToggleAvailability = async () => {
    try {
      const response = await profileService.toggleAvailability();
      setProfile(prev => ({
        ...prev,
        availability_status: response.availabilityStatus
      }));
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <h1 className="nav-title">Genius Prep - Tutor</h1>
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
                Complete your profile to start connecting with students.
              </p>
              <button
                onClick={() => navigate('/tutor/profile/edit')}
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
                  <div className="profile-status">
                    <span className={`status-badge ${profile.availability_status}`}>
                      {profile.availability_status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-value">{profile.subjects?.length || 0}</div>
                  <div className="stat-label">Subjects</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{profile.years_experience || 0}</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">R{profile.hourly_rate || 0}</div>
                  <div className="stat-label">Hourly Rate</div>
                </div>
              </div>

              <div className="profile-actions">
                <button
                  onClick={() => navigate('/tutor/profile/edit')}
                  className="btn-secondary"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleToggleAvailability}
                  className="btn-primary"
                >
                  {profile.availability_status === 'active' 
                    ? 'Set as Unavailable' 
                    : 'Set as Available'}
                </button>
              </div>

              <div className="info-card">
                <p className="info-text">
                  🚀 Your tutor dashboard is under development. 
                  Soon you'll be able to view bookings, messages, and more!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;