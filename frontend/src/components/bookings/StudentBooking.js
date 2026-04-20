import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/booking';
import paymentService from '../../services/payment';

function StudentBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
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

  const handlePayNow = async (bookingId, amount) => {
    if (!window.confirm(`Proceed to payment of R${amount}?`)) {
      return;
    }

    try {
      setPaymentLoading(true);
      console.log('Initiating payment for booking:', bookingId);

      const paymentResponse = await paymentService.createBookingPayment(bookingId);

      console.log('Payment response:', paymentResponse);

      if (paymentResponse && paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('Payment setup failed - missing payment URL');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed: ' + (err.response?.data?.error || err.message || 'Please try again'));
      setPaymentLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      alert('Booking cancelled successfully');
    } catch (err) {
      alert('Failed to cancel booking');
      console.error('Cancel booking error:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'declined':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'completed':
      case 'paid':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'pending':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
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
        <div className="inline-block w-8 h-8 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400">Loading bookings...</p>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">My Booking Requests</h2>
        <button
          onClick={() => navigate('/tutors')}
          className="px-6 py-2.5 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition"
        >
          Browse Tutors
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
          <p className="text-gray-400 mb-6">Start by finding a tutor and requesting a session!</p>
          <button
            onClick={() => navigate('/tutors')}
            className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition"
          >
            Find a Tutor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="glass-card rounded-2xl p-6 transition-all hover:border-[#00CC99]/30"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {booking.tutor_picture ? (
                    <img
                      src={booking.tutor_picture}
                      alt={booking.tutor_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#00CC99]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                      <span className="text-[#00CC99] font-bold text-xl">
                        {booking.tutor_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3
                      className="text-lg font-bold text-white cursor-pointer hover:text-[#00CC99] transition"
                      onClick={() => navigate(`/tutors/${booking.tutor_id}`)}
                    >
                      {booking.tutor_name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Subject: <span className="font-medium text-white">{booking.subject}</span>
                    </p>
                    {booking.number_of_hours && (
                      <p className="text-sm text-gray-400">
                        Duration: <span className="font-medium text-white">{booking.number_of_hours} hours</span>
                      </p>
                    )}
                    {booking.total_amount && (
                      <p className="text-sm font-semibold text-[#00CC99]">
                        Total: R{booking.total_amount}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  {booking.payment_status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadgeClass(booking.payment_status)}`}>
                      {booking.payment_status === 'completed' || booking.payment_status === 'paid'
                        ? '✓ Paid'
                        : booking.payment_status === 'pending'
                        ? 'Payment Pending'
                        : booking.payment_status}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Messages */}
              {booking.status === 'pending' && (
                <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 mb-4 rounded-r-lg">
                  <p className="text-sm text-yellow-300">
                    ⏳ <span className="font-semibold">Waiting for tutor approval</span> - The tutor will review your request soon
                  </p>
                </div>
              )}

              {booking.status === 'accepted' && booking.payment_status === 'pending' && (
                <div className="bg-green-500/10 border-l-4 border-green-500 p-3 mb-4 rounded-r-lg">
                  <p className="text-sm text-green-300">
                    ✓ <span className="font-semibold">Tutor accepted!</span> - Please complete payment to confirm your booking
                  </p>
                </div>
              )}

              {booking.status === 'accepted' && (booking.payment_status === 'completed' || booking.payment_status === 'paid') && (
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                  <p className="text-sm text-blue-300">
                    🎓 <span className="font-semibold">Booking confirmed!</span> - Your session is scheduled
                  </p>
                </div>
              )}

              {booking.status === 'declined' && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
                  <p className="text-sm text-red-300">
                    ✗ <span className="font-semibold">Booking declined</span> - The tutor is not available for this session
                  </p>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="bg-blue-500/10 border-l-4 border-blue-500 p-3 mb-4 rounded-r-lg">
                  <p className="text-sm text-blue-300">
                    ✓ <span className="font-semibold">Session completed!</span> - Thank you for using Genius Accelerator
                  </p>
                </div>
              )}

              {booking.message && (
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Your message: </span>
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
                <p className="text-xs text-gray-500">
                  Requested on {formatDate(booking.created_at)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/tutors/${booking.tutor_id}`)}
                    className="px-4 py-2 text-sm bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition border border-white/10"
                  >
                    View Tutor
                  </button>

                  {/* PAY NOW BUTTON */}
                  {booking.status === 'accepted' &&
                   booking.payment_status === 'pending' &&
                   booking.total_amount && (
                    <button
                      onClick={() => handlePayNow(booking.id, booking.total_amount)}
                      disabled={paymentLoading}
                      className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>💳 Pay Now - R{booking.total_amount}</>
                      )}
                    </button>
                  )}

                  {/* CANCEL BUTTON */}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition border border-red-500/30"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* PAID CONFIRMATION */}
                  {(booking.payment_status === 'completed' || booking.payment_status === 'paid') && (
                    <div className="px-4 py-2 text-sm bg-green-500/20 text-green-300 rounded-lg font-semibold border border-green-500/30">
                      ✓ Payment Completed
                    </div>
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