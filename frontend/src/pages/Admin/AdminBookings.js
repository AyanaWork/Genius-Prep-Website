import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './AdminBookings.css';

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  
  // Modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [statusFilter, searchTerm, sortBy, sortOrder]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchTerm,
        sortBy,
        order: sortOrder
      });
      
      const response = await api.get(`/admin/bookings?${params}`);
      setBookings(response.data.bookings);
      setError('');
    } catch (err) {
      console.error('Load bookings error:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/bookings/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Accept this booking on behalf of the tutor? Both student and tutor will be notified.')) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/bookings/${bookingId}/accept`);
      alert('Booking accepted successfully! Emails sent to student and tutor.');
      loadBookings();
      loadStats();
    } catch (err) {
      console.error('Accept booking error:', err);
      alert(err.response?.data?.error || 'Failed to accept booking');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeclineModal = (booking) => {
    setSelectedBooking(booking);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleDeclineBooking = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/bookings/${selectedBooking.id}/decline`, {
        reason: declineReason
      });
      alert('Booking declined. Email sent to student.');
      setShowDeclineModal(false);
      loadBookings();
      loadStats();
    } catch (err) {
      console.error('Decline booking error:', err);
      alert(err.response?.data?.error || 'Failed to decline booking');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      accepted: 'badge-success',
      declined: 'badge-danger',
      completed: 'badge-info',
      cancelled: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    try {
      if (typeof timeString === 'string' && timeString.includes(':')) {
        return timeString.substring(0, 5); 
      }
      return timeString;
    } catch (error) {
      return 'Not set';
    }
  };

  const getPendingDuration = (hoursPending) => {
    if (hoursPending < 1) return `${Math.round(hoursPending * 60)}m ago`;
    if (hoursPending < 24) return `${Math.round(hoursPending)}h ago`;
    return `${Math.round(hoursPending / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-800 hover:text-primary-900 transition"
            >
              Genius Prep Tuition
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium border border-primary-200"
              >
                Booking Management
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all student bookings</p>
        </div>
      </div>

      <div className="admin-bookings-container">

        {/* Statistics Cards */}
        <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending_count || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon warning">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.old_pending_count || 0}</div>
            <div className="stat-label">Pending &gt;24h</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.accepted_count || 0}</div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">🎓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed_count || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="declined">Declined</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Student, tutor, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="created_at">Date Created</option>
            <option value="date">Booking Date</option>
            <option value="status">Status</option>
            <option value="subject">Subject</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order:</label>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && (
        <div className="table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Tutor</th>
                <th>Subject</th>
                <th>Date & Time</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Pending Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state">
                    <p>No bookings found</p>
                  </td>
                </tr>
              ) : (
                bookings.map(booking => (
                  <tr 
                    key={booking.id}
                    className={
                      booking.status === 'pending' && booking.hours_pending > 24 
                        ? 'booking-row old-pending' 
                        : 'booking-row'
                    }
                  >
                    <td>#{booking.id}</td>
                    <td>
                      <div className="user-cell">
                        <strong>{booking.student_name}</strong>
                        <small>{booking.student_email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <strong>{booking.tutor_name}</strong>
                        <small>{booking.tutor_email}</small>
                      </div>
                    </td>
                    <td>{booking.subject}</td>
                    <td>
                      <div className="date-cell">
                        <div>{formatDate(booking.preferred_date || booking.date)}</div>
                        <small>{formatTime(booking.preferred_time || booking.time)}</small>
                      </div>
                    </td>
                    <td>{booking.number_of_hours || 3}h</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.accepted_by_admin && (
                        <span className="admin-badge">Admin</span>
                      )}
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <span className={booking.hours_pending > 24 ? 'text-danger' : ''}>
                          {getPendingDuration(booking.hours_pending)}
                        </span>
                      )}
                    </td>
                    <td>
                      {booking.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleAcceptBooking(booking.id)}
                            disabled={actionLoading}
                            className="btn-accept"
                            title="Accept booking on behalf of tutor"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => openDeclineModal(booking)}
                            disabled={actionLoading}
                            className="btn-decline"
                            title="Decline booking"
                          >
                            ✗ Decline
                          </button>
                        </div>
                      )}
                      {booking.status !== 'pending' && (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="modal-overlay" onClick={() => setShowDeclineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Decline Booking</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowDeclineModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <h3>Booking Details:</h3>
                <p><strong>Student:</strong> {selectedBooking?.student_name}</p>
                <p><strong>Tutor:</strong> {selectedBooking?.tutor_name}</p>
                <p><strong>Subject:</strong> {selectedBooking?.subject}</p>
                <p><strong>Date:</strong> {formatDate(selectedBooking?.preferred_date || selectedBooking?.date)} at {formatTime(selectedBooking?.preferred_time || selectedBooking?.time)}</p>
              </div>

              <div className="form-group">
                <label>Reason for declining: *</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="E.g., Tutor unavailable for this time slot, subject expertise mismatch, etc."
                  rows="4"
                  className="decline-textarea"
                />
              </div>

              <p className="note">
                The student will receive an email notification with this reason.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeclineBooking}
                className="btn-danger"
                disabled={actionLoading || !declineReason.trim()}
              >
                {actionLoading ? 'Declining...' : 'Decline Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default AdminBookings;