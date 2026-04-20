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
    <div className="bg-[#0f172a] rounded-xl p-5 shadow-lg border border-[#00CC99]/30">
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Request a Session
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Subject <span className="text-[#00CC99]">*</span>
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/20 rounded-lg focus:border-[#00CC99] focus:outline-none text-white placeholder-white/40"
            placeholder="e.g., Mathematics, Physics"
            required
          />
        </div>

        {/* Number of Hours */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Number of Hours <span className="text-[#00CC99]">*</span>
          </label>
          <div className="flex items-center gap-3">
            {/* Minus Button */}
            <button
              type="button"
              onClick={decrementHours}
              disabled={formData.numberOfHours <= 3}
              className="w-10 h-10 flex items-center justify-center bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition disabled:opacity-40"
              aria-label="Decrease hours"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-4 py-2 text-center text-xl font-bold bg-[#0f172a]/50 border border-white/20 rounded-lg focus:border-[#00CC99] focus:outline-none text-white"
                inputMode="numeric"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-sm text-white/50">hrs</span>
              </div>
            </div>

            {/* Plus Button */}
            <button
              type="button"
              onClick={incrementHours}
              className="w-10 h-10 flex items-center justify-center bg-[#00CC99] border border-[#00CC99] rounded-lg hover:bg-[#00CC99]/80 transition"
              aria-label="Increase hours"
            >
              <svg className="w-5 h-5 text-[#0f172a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-white/50 mt-2">Minimum: 3 hours</p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-lg p-3">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-white/80">Hourly Rate:</span>
            <span className="text-sm font-semibold text-white">R{hourlyRate}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-white/80">Number of Hours:</span>
            <span className="text-sm font-semibold text-white">{formData.numberOfHours}</span>
          </div>
          <div className="border-t border-[#00CC99]/30 pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-bold text-white">Total Amount:</span>
              <span className="font-bold text-[#00CC99] text-lg">R{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Message (Optional) */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Message (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={3}
            className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/20 rounded-lg focus:border-[#00CC99] focus:outline-none text-white placeholder-white/40"
            placeholder="Tell the tutor about your learning goals..."
          />
        </div>

        {/* Preferred Date & Time (Optional) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
              className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/20 rounded-lg focus:border-[#00CC99] focus:outline-none text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Preferred Time
            </label>
            <input
              type="time"
              value={formData.preferredTime}
              onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
              className="w-full px-4 py-2 bg-[#0f172a]/50 border border-white/20 rounded-lg focus:border-[#00CC99] focus:outline-none text-white"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Request Booking • R${totalAmount}`}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition"
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