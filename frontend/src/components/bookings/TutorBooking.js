import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/booking';

function TutorBookings() {
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
  const [activeTab, setActiveTab] = useState('pending'); // pending, accepted, completed, declined

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    return timeString;
  };

  const filteredBookings = bookings.filter(
    booking => booking.status === activeTab
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading booking requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-800">{stats.pending_count || 0}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-2xl font-bold text-green-800">{stats.accepted_count || 0}</p>
          <p className="text-sm text-green-600">Accepted</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-2xl font-bold text-blue-800">{stats.completed_count || 0}</p>
          <p className="text-sm text-blue-600">Completed</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">{stats.total_bookings || 0}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['pending', 'accepted', 'completed', 'declined'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} (
            {bookings.filter(b => b.status === tab).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">✎𓂃</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {activeTab} booking requests
          </h3>
          <p className="text-gray-600">
            {activeTab === 'pending'
              ? "You don't have any pending requests at the moment."
              : `You don't have any ${activeTab} bookings right now.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {booking.student_picture ? (
                    <img
                      src={booking.student_picture}
                      alt={booking.student_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                      <span className="text-primary-600 font-semibold text-xl">
                        {booking.student_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {booking.student_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Subject: <span className="font-medium">{booking.subject}</span>
                    </p>
                    {booking.education_level && (
                      <p className="text-sm text-gray-600">
                        Level: <span className="font-medium">{booking.education_level}</span>
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              {booking.message && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Student's message: </span>
                    {booking.message}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(booking.preferred_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Preferred Time</p>
                  <p className="text-sm font-medium text-gray-900">{formatTime(booking.preferred_time)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Requested on {formatDate(booking.created_at)}
                </p>
                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'declined')}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'accepted' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Mark as Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'declined')}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Cancel / Decline
                      </button>
                    </>
                  )}

                  {booking.status === 'declined' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Move to Accepted
                    </button>
                  )}

                  {booking.status === 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Move to Accepted
                    </button>
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