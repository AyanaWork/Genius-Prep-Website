import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import authService from '../../services/auth';
import TutorBookings from '../../components/bookings/TutorBooking';
import companyLogo from '../../assets/logos/GA_1.jpeg';
import Navbar from '../../components/common/NavBar';

function TutorDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
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
        const reviewsResponse = await reviewService.getTutorReviews(profileResponse.profile.id);
        setReviews(reviewsResponse.reviews || []);
        setStats({
          averageRating: parseFloat(profileResponse.profile.average_rating || 0).toFixed(1),
          totalReviews: profileResponse.profile.review_count || 0
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar */}
       <Navbar />
      {/* Main Content */}
      <div className="pt-24 pb-16 px-6 container mx-auto">
        {activeView === 'bookings' ? (
          <TutorBookings />
        ) : activeView === 'reviews' ? (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All My Reviews</h2>
              <button onClick={() => setActiveView('overview')} className="text-[#00CC99] hover:underline">← Back</button>
            </div>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">⭐</div>
                <p className="text-gray-400">No reviews yet. Start teaching!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-[#0f172a]/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      {review.student_picture ? (
                        <img src={review.student_picture} alt={review.student_name} className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#00CC99]/20 flex items-center justify-center">
                          <span className="text-[#00CC99] font-bold">{review.student_name?.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-semibold">{review.student_name}</h4>
                          <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-[#00CC99] fill-current' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          ))}
                        </div>
                        {review.review_text && <p className="text-gray-300">{review.review_text}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : !profile ? (
          <div className="glass-card rounded-3xl p-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Become a Tutor</h1>
            <p className="text-gray-300 mb-8">Complete your tutor profile to start accepting students.</p>
            <button onClick={() => navigate('/tutor/profile/edit')} className="px-8 py-4 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">Create Profile</button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Approval Status */}
            {profile.approval_status !== 'approved' && (
              <div className={`p-6 rounded-xl border-l-4 ${profile.approval_status === 'rejected' ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'}`}>
                <p className="font-bold">Profile Status: {profile.approval_status}</p>
                {profile.approval_status === 'pending' && <p className="text-sm text-gray-300">Under review by admin. You'll be able to accept bookings once approved.</p>}
                {profile.approval_status === 'rejected' && profile.rejection_reason && <p className="text-sm mt-2">Reason: {profile.rejection_reason}</p>}
              </div>
            )}

            {/* Profile Header */}
            <div className="glass-card rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-6">
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.display_name} className="w-24 h-24 rounded-full border-4 border-[#00CC99]" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                    <span className="text-4xl font-bold text-[#00CC99]">{profile.display_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  <p className="text-gray-400">{currentUser?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < Math.floor(stats.averageRating) ? 'text-[#00CC99] fill-current' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">({stats.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/tutor/profile/edit')} className="px-4 py-2 glass-card rounded-lg hover:border-[#00CC99]/50">Edit Profile</button>
                <button onClick={handleToggleAvailability} className={`px-4 py-2 rounded-lg font-semibold ${profile.availability_status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {profile.availability_status === 'active' ? '✓ Available' : '✗ Unavailable'}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{profile.subjects?.length || 0}</div>
                <div className="text-sm text-gray-400">Subjects</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{profile.years_experience || 0}</div>
                <div className="text-sm text-gray-400">Years Exp.</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">R{profile.hourly_rate || 0}</div>
                <div className="text-sm text-gray-400">Hourly Rate</div>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{stats.averageRating}</div>
                <div className="text-sm text-gray-400">Rating</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => setActiveView('bookings')} className="glass-card rounded-xl p-6 text-left hover:border-[#00CC99]/50 transition">
                <div className="text-3xl mb-2">📅</div>
                <h3 className="font-bold">Manage Bookings</h3>
                <p className="text-sm text-gray-400">Respond to requests</p>
              </button>
              <button onClick={() => setActiveView('reviews')} className="glass-card rounded-xl p-6 text-left hover:border-[#00CC99]/50 transition">
                <div className="text-3xl mb-2">⭐</div>
                <h3 className="font-bold">View Reviews</h3>
                <p className="text-sm text-gray-400">See student feedback</p>
              </button>
              <button onClick={() => profile.id && navigate(`/tutors/${profile.id}`)} className="glass-card rounded-xl p-6 text-left hover:border-[#00CC99]/50 transition">
                <div className="text-3xl mb-2">👁️</div>
                <h3 className="font-bold">Public Profile</h3>
                <p className="text-sm text-gray-400">Preview as student</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorDashboard;