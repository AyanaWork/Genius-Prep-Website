import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadBookings(); loadStats(); }, [statusFilter, searchTerm, sortBy, sortOrder]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status: statusFilter, search: searchTerm, sortBy, order: sortOrder });
      const response = await api.get(`/admin/bookings?${params}`);
      setBookings(response.data.bookings);
    } catch (err) { setError('Failed to load bookings'); }
    finally { setLoading(false); }
  };
  const loadStats = async () => {
    try { const res = await api.get('/admin/bookings/stats'); setStats(res.data.stats); }
    catch (err) { console.error(err); }
  };
  const handleAcceptBooking = async (bookingId) => {
    if (!window.confirm('Accept this booking?')) return;
    setActionLoading(true);
    try { await api.post(`/admin/bookings/${bookingId}/accept`); alert('Accepted'); loadBookings(); loadStats(); }
    catch (err) { alert('Failed'); }
    finally { setActionLoading(false); }
  };
  const openDeclineModal = (booking) => { setSelectedBooking(booking); setDeclineReason(''); setShowDeclineModal(true); };
  const handleDeclineBooking = async () => {
    if (!declineReason.trim()) return alert('Please provide a reason');
    setActionLoading(true);
    try { await api.post(`/admin/bookings/${selectedBooking.id}/decline`, { reason: declineReason }); alert('Declined'); setShowDeclineModal(false); loadBookings(); loadStats(); }
    catch (err) { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-ZA') : 'N/A';
  const getStatusBadge = (status) => {
    const classes = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      accepted: 'bg-green-500/20 text-green-400 border-green-500/40',
      declined: 'bg-red-500/20 text-red-400 border-red-500/40',
      completed: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${classes[status] || 'bg-gray-500/20 border-gray-500/40'}`}>{status}</span>;
  };

  return (
    // No <Navbar /> here — the parent <Layout /> route element supplies one.
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="glass-card rounded-3xl p-8 mb-8 border border-white/10">
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-[1.15] pb-1 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
            Booking Management
          </h1>
          <p className="text-gray-400">Review, accept or decline tutor booking requests.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-4 text-center border border-white/15"><div className="text-2xl font-bold text-[#00CC99]">{stats.pending_count || 0}</div><div className="text-xs text-gray-400">Pending</div></div>
          <div className="glass-card rounded-xl p-4 text-center border border-yellow-500/30"><div className="text-2xl font-bold text-yellow-400">{stats.old_pending_count || 0}</div><div className="text-xs text-gray-400">Pending &gt;24h</div></div>
          <div className="glass-card rounded-xl p-4 text-center border border-green-500/30"><div className="text-2xl font-bold text-green-400">{stats.accepted_count || 0}</div><div className="text-xs text-gray-400">Accepted</div></div>
          <div className="glass-card rounded-xl p-4 text-center border border-blue-500/30"><div className="text-2xl font-bold text-blue-400">{stats.completed_count || 0}</div><div className="text-xs text-gray-400">Completed</div></div>
        </div>

        <div className="glass-card rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 border border-white/10">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f172a]/60 border border-white/15 rounded-xl px-4 py-2 text-white">
            <option value="all">All Status</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="completed">Completed</option>
          </select>
          <input type="text" placeholder="Search student/tutor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#0f172a]/60 border border-white/15 rounded-xl px-4 py-2 text-white placeholder-gray-500" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#0f172a]/60 border border-white/15 rounded-xl px-4 py-2 text-white">
            <option value="created_at">Date Created</option><option value="date">Booking Date</option><option value="status">Status</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-[#0f172a]/60 border border-white/15 rounded-xl px-4 py-2 text-white">
            <option value="DESC">Newest First</option><option value="ASC">Oldest First</option>
          </select>
        </div>

        {loading ? <div className="text-center py-12">Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
          <div className="glass-card rounded-3xl overflow-x-auto border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-[#0f172a]/40"><tr><th className="p-4 text-left">ID</th><th>Student</th><th>Tutor</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-[#0f172a]/40">
                    <td className="p-4">#{b.id}</td>
                    <td><div><strong>{b.student_name}</strong><br/><small className="text-gray-400">{b.student_email}</small></div></td>
                    <td><div><strong>{b.tutor_name}</strong><br/><small>{b.tutor_email}</small></div></td>
                    <td>{b.subject}</td>
                    <td>{formatDate(b.preferred_date || b.date)} at {b.preferred_time || b.time}</td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td>{b.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleAcceptBooking(b.id)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs border border-green-500/40">Accept</button><button onClick={() => openDeclineModal(b)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs border border-red-500/40">Decline</button></div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-white/10">
            <h3 className="text-xl font-bold mb-4">Decline Booking</h3>
            <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows="4" className="w-full bg-[#0f172a]/60 border border-white/15 rounded-xl p-3 text-white placeholder-gray-500" placeholder="Reason for declining..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 py-2 glass-card rounded-xl border border-white/15">Cancel</button>
              <button onClick={handleDeclineBooking} disabled={actionLoading} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/40">Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
