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
      
      // Call payment service to create booking payment
      const paymentResponse = await paymentService.createBookingPayment(bookingId);

      console.log('Payment response:', paymentResponse);

      if (paymentResponse && paymentResponse.paymentUrl && paymentResponse.paymentData) {
        // Create form and redirect to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentResponse.paymentUrl;

        Object.keys(paymentResponse.paymentData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentResponse.paymentData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        console.log('Submitting payment form to PayFast...');
        form.submit();
      } else {
        throw new Error('Payment setup failed - missing payment URL or data');
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

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
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
          <div className="text-5xl mb-4">📚</div>
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
                    {booking.number_of_hours && (
                      <p className="text-sm text-gray-600">
                        Duration: <span className="font-medium">{booking.number_of_hours} hours</span>
                      </p>
                    )}
                    {booking.total_amount && (
                      <p className="text-sm font-semibold text-primary-600">
                        Total: R{booking.total_amount}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
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
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⏳ <span className="font-semibold">Waiting for tutor approval</span> - The tutor will review your request soon
                  </p>
                </div>
              )}

              {booking.status === 'accepted' && booking.payment_status === 'pending' && (
                <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
                  <p className="text-sm text-green-800">
                    ✓ <span className="font-semibold">Tutor accepted!</span> - Please complete payment to confirm your booking
                  </p>
                </div>
              )}

              {booking.status === 'accepted' && (booking.payment_status === 'completed' || booking.payment_status === 'paid') && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    🎓 <span className="font-semibold">Booking confirmed!</span> - Your session is scheduled
                  </p>
                </div>
              )}

              {booking.status === 'declined' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                  <p className="text-sm text-red-800">
                    ✗ <span className="font-semibold">Booking declined</span> - The tutor is not available for this session
                  </p>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ✓ <span className="font-semibold">Session completed!</span> - Thank you for using Genius Prep
                  </p>
                </div>
              )}

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

                  {/* PAY NOW BUTTON - Only show if tutor accepted and payment pending */}
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
                        <>
                          💳 Pay Now - R{booking.total_amount}
                        </>
                      )}
                    </button>
                  )}

                  {/* CANCEL BUTTON - Only for pending bookings */}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* PAID CONFIRMATION - Show for completed payments */}
                  {(booking.payment_status === 'completed' || booking.payment_status === 'paid') && (
                    <div className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg font-semibold">
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