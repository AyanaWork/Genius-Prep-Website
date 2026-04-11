import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/booking';

function TutorBookings({ onBack }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    pending_count: 0,
    accepted_count: 0,
    completed_count: 0,
    declined_count: 0,
    total_bookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getTutorBookings();
      setBookings(response.bookings || []);
      setStats(response.stats || {
        pending_count: 0,
        accepted_count: 0,
        completed_count: 0,
        declined_count: 0,
        total_bookings: 0
      });
    } catch (err) {
      setError('Failed to load booking requests');
      console.error('Load bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      await loadBookings();
      alert('Status updated!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'declined': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    return timeString;
  };

  const filteredBookings = bookings.filter(booking => booking.status === activeTab);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading booking requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Booking Requests</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 glass-card rounded-xl text-sm hover:border-[#00CC99]/50 transition"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.pending_count || 0}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.accepted_count || 0}</div>
          <div className="text-xs text-gray-400">Accepted</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.completed_count || 0}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.total_bookings || 0}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10">
        {['pending', 'accepted', 'completed', 'declined'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'text-[#00CC99] border-b-2 border-[#00CC99]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({bookings.filter(b => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">No {activeTab} booking requests</h3>
          <p className="text-gray-400">
            {activeTab === 'pending'
              ? "You don't have any pending requests at the moment."
              : `You don't have any ${activeTab} bookings right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="glass-card rounded-2xl p-6 transition-all hover:border-[#00CC99]/30">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {booking.student_picture ? (
                    <img src={booking.student_picture} alt={booking.student_name} className="w-16 h-16 rounded-full object-cover border-2 border-[#00CC99]" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                      <span className="text-[#00CC99] font-bold text-xl">{booking.student_name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{booking.student_name}</h3>
                    <p className="text-sm text-gray-400">Subject: <span className="font-medium text-white">{booking.subject}</span></p>
                    {booking.education_level && (
                      <p className="text-sm text-gray-400">Level: <span className="font-medium text-white">{booking.education_level}</span></p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              {booking.message && (
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Student's message: </span>
                    {booking.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                  <p className="text-sm font-medium text-white">{formatDate(booking.preferred_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preferred Time</p>
                  <p className="text-sm font-medium text-white">{formatTime(booking.preferred_time)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">Requested on {formatDate(booking.created_at)}</p>
                <div className="flex flex-wrap gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(booking.id, 'accepted')} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Accept</button>
                      <button onClick={() => handleUpdateStatus(booking.id, 'declined')} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Decline</button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <>
                      <button onClick={() => handleUpdateStatus(booking.id, 'completed')} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Mark Completed</button>
                      <button onClick={() => handleUpdateStatus(booking.id, 'declined')} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Cancel</button>
                    </>
                  )}
                  {(booking.status === 'declined' || booking.status === 'completed') && (
                    <button onClick={() => handleUpdateStatus(booking.id, 'accepted')} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Move to Accepted</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TutorBookings;