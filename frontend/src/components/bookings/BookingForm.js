import React, { useState } from 'react';
import paymentService from '../../services/payment';

function BookingForm({ tutorId, tutorName, hourlyRate, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
    numberOfHours: 3 // Minimum 3 hours
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate total amount
  const totalAmount = (formData.numberOfHours * hourlyRate).toFixed(2);

  // Mobile-friendly hour controls
  const incrementHours = () => {
    setFormData(prev => ({
      ...prev,
      numberOfHours: prev.numberOfHours + 1
    }));
  };

  const decrementHours = () => {
    if (formData.numberOfHours > 3) {
      setFormData(prev => ({
        ...prev,
        numberOfHours: prev.numberOfHours - 1
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.subject) {
      setError('Please enter a subject');
      setLoading(false);
      return;
    }

    if (formData.numberOfHours < 3) {
      setError('Minimum booking is 3 hours');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create booking
      const bookingResponse = await onSubmit({
        tutorId,
        ...formData,
        totalAmount
      });

      if (bookingResponse && bookingResponse.booking) {
        const bookingId = bookingResponse.booking.id;
        
        // Step 2: Process payment
        const paymentResponse = await paymentService.createBookingPayment(bookingId);

        if (paymentResponse && paymentResponse.paymentUrl && paymentResponse.paymentData) {
          // Create form and submit to PayFast
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
          form.submit();
        } else {
          alert('Booking created but payment failed. Contact support.');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to process booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Request a Session
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Mathematics, Physics"
            required
          />
        </div>

        {/* Number of Hours - Mobile Friendly */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Hours <span className="text-red-500">*</span>
          </label>
          
          {/* Button Controls */}
          <div className="flex items-center gap-3">
            {/* Minus Button */}
            <button
              type="button"
              onClick={decrementHours}
              disabled={formData.numberOfHours <= 3}
              className="w-12 h-12 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease hours"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* Hours Input */}
            <div className="flex-1 relative">
              <input
                type="number"
                min="3"
                value={formData.numberOfHours}
                onChange={(e) => setFormData({...formData, numberOfHours: Math.max(3, parseInt(e.target.value) || 3)})}
                className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                inputMode="numeric"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-sm text-gray-500">hrs</span>
              </div>
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={incrementHours}
              className="w-12 h-12 flex items-center justify-center bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700 active:bg-primary-800 transition"
              aria-label="Increase hours"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-sm text-gray-500 mt-2">
            Minimum: 3 hours • Tap − or + to adjust
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-700">Hourly Rate:</span>
            <span className="text-sm font-semibold">R{hourlyRate}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-700">Number of Hours:</span>
            <span className="text-sm font-semibold">{formData.numberOfHours}</span>
          </div>
          <div className="border-t border-blue-300 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Total Amount:</span>
              <span className="font-bold text-primary-600 text-lg">R{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Tell the tutor about your learning goals..."
          />
        </div>

        {/* Preferred Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <input
              type="time"
              value={formData.preferredTime}
              onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Request Booking`}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default BookingForm;