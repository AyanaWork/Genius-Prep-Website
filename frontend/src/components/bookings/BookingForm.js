import React, { useState } from 'react';

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
      await onSubmit({
        tutorId,
        ...formData,
        totalAmount
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-md border border-primary-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Request a Session with {tutorName}
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

        {/* Number of Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Hours <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="3"
            value={formData.numberOfHours}
            onChange={(e) => setFormData({...formData, numberOfHours: parseInt(e.target.value) || 3})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Minimum: 3 hours</p>
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
        <div className="grid grid-cols-2 gap-4">
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
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay R${totalAmount} & Book`}
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