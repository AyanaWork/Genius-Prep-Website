import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/booking';

function StudentBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getMyBookings();
      setBookings(response.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Load bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings(); // Reload bookings
      alert('Booking cancelled successfully');
    } catch (err) {
      alert('Failed to cancel booking');
      console.error('Cancel booking error:', err);
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading bookings...</p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Booking Requests</h2>
        <button
          onClick={() => navigate('/tutors')}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Browse Tutors
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-5xl mb-4">🕮</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Start by finding a tutor and requesting a session!</p>
          <button
            onClick={() => navigate('/tutors')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Find a Tutor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {booking.tutor_picture ? (
                    <img
                      src={booking.tutor_picture}
                      alt={booking.tutor_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                      <span className="text-primary-600 font-semibold text-xl">
                        {booking.tutor_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 
                      className="text-lg font-bold text-gray-900 cursor-pointer hover:text-primary-600 transition"
                      onClick={() => navigate(`/tutors/${booking.tutor_id}`)}
                    >
                      {booking.tutor_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Subject: <span className="font-medium">{booking.subject}</span>
                    </p>
                    {booking.hourly_rate && (
                      <p className="text-sm text-gray-600">
                        Rate: <span className="font-medium">R{booking.hourly_rate}/hr</span>
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
                    <span className="font-semibold">Your message: </span>
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
                  <button
                    onClick={() => navigate(`/tutors/${booking.tutor_id}`)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    View Tutor
                  </button>
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Cancel Request
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

export default StudentBookings;
