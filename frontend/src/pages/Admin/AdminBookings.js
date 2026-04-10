import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import companyLogo from '../../assets/logos/GA_1.jpeg';

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
    const classes = { pending: 'bg-yellow-500/20 text-yellow-400', accepted: 'bg-green-500/20 text-green-400', declined: 'bg-red-500/20 text-red-400', completed: 'bg-blue-500/20 text-blue-400' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[status] || 'bg-gray-500/20'}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
            <span className="text-[#00CC99] font-black text-xl tracking-tighter">GENIUS ACCELERATOR</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/admin/dashboard')} className="text-sm text-white/70 hover:text-[#00CC99]">Dashboard</button>
            <button onClick={() => navigate('/admin/bookings')} className="text-sm text-[#00CC99] border-b border-[#00CC99]">Bookings</button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Logout</button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h1 className="text-3xl font-black mb-2">Booking Management</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-[#00CC99]">{stats.pending_count || 0}</div><div className="text-xs text-gray-400">Pending</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{stats.old_pending_count || 0}</div><div className="text-xs text-gray-400">Pending &gt;24h</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-green-400">{stats.accepted_count || 0}</div><div className="text-xs text-gray-400">Accepted</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-blue-400">{stats.completed_count || 0}</div><div className="text-xs text-gray-400">Completed</div></div>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-3xl p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#0f172a]/5 border border-white/10 rounded-xl px-4 py-2">
            <option value="all">All Status</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="completed">Completed</option>
          </select>
          <input type="text" placeholder="Search student/tutor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#0f172a]/5 border border-white/10 rounded-xl px-4 py-2" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#0f172a]/5 border border-white/10 rounded-xl px-4 py-2">
            <option value="created_at">Date Created</option><option value="date">Booking Date</option><option value="status">Status</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-[#0f172a]/5 border border-white/10 rounded-xl px-4 py-2">
            <option value="DESC">Newest First</option><option value="ASC">Oldest First</option>
          </select>
        </div>

        {loading ? <div className="text-center py-12">Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
          <div className="glass-card rounded-3xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-[#0f172a]/5"><tr><th className="p-4 text-left">ID</th><th>Student</th><th>Tutor</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-[#0f172a]/5">
                    <td className="p-4">#{b.id}</td><td><div><strong>{b.student_name}</strong><br/><small className="text-gray-400">{b.student_email}</small></div></td>
                    <td><div><strong>{b.tutor_name}</strong><br/><small>{b.tutor_email}</small></div></td>
                    <td>{b.subject}</td><td>{formatDate(b.preferred_date || b.date)} at {b.preferred_time || b.time}</td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td>{b.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleAcceptBooking(b.id)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">Accept</button><button onClick={() => openDeclineModal(b)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs">Decline</button></div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Decline Booking</h3>
            <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows="4" className="w-full bg-[#0f172a]/5 border border-white/10 rounded-xl p-3" placeholder="Reason for declining..." />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowDeclineModal(false)} className="flex-1 py-2 glass-card rounded-xl">Cancel</button>
              <button onClick={handleDeclineBooking} disabled={actionLoading} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl">Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;