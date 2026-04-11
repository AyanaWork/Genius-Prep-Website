import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import bookingService from '../../services/booking';
import authService from '../../services/auth';
import StudentBookings from '../../components/bookings/StudentBooking';
import companyLogo from '../../assets/logos/GA_1.jpeg';   
import Navbar from '../../components/common/NavBar';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navigation Bar  */}
      {/* Main Content */}
      <div className="pt-24 pb-16 px-6 container mx-auto">
        {activeView === 'bookings' ? (
          <StudentBookings />
        ) : !profile ? (
          <div className="glass-card rounded-3xl p-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Welcome to Genius Accelerator!</h1>
            <p className="text-gray-300 mb-8">Complete your student profile to start finding the perfect tutors.</p>
            <button onClick={() => navigate('/student/profile/edit')} className="px-8 py-4 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">Create Your Profile</button>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-8 md:p-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-white/10 pb-8 mb-8">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt={profile.display_name} className="w-28 h-28 rounded-full object-cover border-4 border-[#00CC99]" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                  <span className="text-4xl font-bold text-[#00CC99]">{profile.display_name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-1">{profile.display_name}</h2>
                <p className="text-gray-400 mb-3">{currentUser?.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.education_level && <span className="px-3 py-1 bg-[#00CC99]/10 rounded-full text-sm text-[#00CC99]">📚 {profile.education_level}</span>}
                  {profile.location && <span className="px-3 py-1 bg-[#00CC99]/10 rounded-full text-sm text-[#00CC99]">📍 {profile.location}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-[#0f172a]/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{bookings.length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Bookings</div>
              </div>
              <div className="bg-[#0f172a]/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{bookings.filter(b => b.status === 'pending').length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Pending</div>
              </div>
              <div className="bg-[#0f172a]/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{bookings.filter(b => b.status === 'accepted').length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Accepted</div>
              </div>
              <div className="bg-[#0f172a]/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-[#00CC99]">{bookings.filter(b => b.status === 'completed').length}</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Completed</div>
              </div>
            </div>

            {/* Subjects */}
            {profile.subjects_interested?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Subjects of Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.subjects_interested.map((s, i) => (
                    <span key={i} className="px-4 py-2 bg-[#0f172a]/5 rounded-full text-sm border border-white/10">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <button onClick={() => navigate('/tutors')} className="px-4 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">🔍 Find a Tutor</button>
              <button onClick={() => setActiveView('bookings')} className="px-4 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition">📅 My Bookings</button>
              <button onClick={() => navigate('/gpa')} className="px-4 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition">🤖 GPA AI</button>
              <button onClick={() => navigate('/student/profile/edit')} className="px-4 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition">✏️ Edit Profile</button>
            </div>

            {/* Tip */}
            <div className="bg-[#00CC99]/10 border border-[#00CC99]/20 rounded-xl p-4 text-sm text-gray-300">
              💡 <strong className="text-[#00CC99]">Quick Tip:</strong> Keep your profile updated to help tutors understand your learning needs better.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;