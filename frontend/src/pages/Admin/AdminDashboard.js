import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/common/NavBar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [tutors, setTutors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let tutorsResponse;
      if (activeTab === 'pending') tutorsResponse = await axios.get(`${API_URL}/admin/tutors/pending`, config);
      else tutorsResponse = await axios.get(`${API_URL}/admin/tutors?status=${activeTab}`, config);
      setTutors(tutorsResponse.data.tutors || []);
      const statsResponse = await axios.get(`${API_URL}/admin/stats`, config);
      setStats(statsResponse.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const viewTutorDetails = async (tutorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/tutors/${tutorId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedTutor(response.data.tutor);
      setShowModal(true);
    } catch (err) { alert('Failed to load tutor details'); }
  };

  const changeStatusToApproved = async (tutorId) => {
    if (!window.confirm('Approve this tutor?')) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Tutor approved');
      setShowModal(false);
      loadData();
    } catch (err) { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  const changeStatusToRejected = async (tutorId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/reject`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
      alert('Tutor rejected');
      setShowModal(false);
      loadData();
    } catch (err) { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h1 className="text-3xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage tutors and platform</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="glass-card rounded-xl p-6 text-center"><div className="text-3xl font-bold text-[#00CC99]">{stats.totalStudents || 0}</div><div className="text-sm text-gray-400">Students</div></div>
            <div className="glass-card rounded-xl p-6 text-center"><div className="text-3xl font-bold text-[#00CC99]">{stats.totalTutors || 0}</div><div className="text-sm text-gray-400">Approved Tutors</div></div>
            <div className="glass-card rounded-xl p-6 text-center"><div className="text-3xl font-bold text-[#00CC99]">{stats.totalBookings || 0}</div><div className="text-sm text-gray-400">Bookings</div></div>
            <div className="glass-card rounded-xl p-6 text-center"><div className="text-3xl font-bold text-[#00CC99]">{stats.totalUsers || 0}</div><div className="text-sm text-gray-400">Total Users</div></div>
          </div>
        )}

        <div className="glass-card rounded-3xl p-6">
          <div className="flex gap-4 border-b border-white/10 mb-6">
            {['pending', 'approved', 'rejected'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-6 font-semibold transition ${activeTab === tab ? 'text-[#00CC99] border-b-2 border-[#00CC99]' : 'text-white/70 hover:text-white'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? <div className="text-center py-12">Loading...</div> : error ? <div className="text-red-400">{error}</div> : tutors.length === 0 ? <div className="text-center py-12 text-gray-400">No tutors found</div> : (
            <div className="space-y-4">
              {tutors.map(tutor => (
                <div key={tutor.id} className="bg-[#0f172a]/5 rounded-xl p-4 hover:bg-[#0f172a]/10 transition cursor-pointer" onClick={() => viewTutorDetails(tutor.id)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{tutor.display_name || tutor.email}</h3>
                      <p className="text-sm text-gray-400">{tutor.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Subjects: {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects || 'None'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tutor.approval_status === 'approved' ? 'bg-green-500/20 text-green-400' : tutor.approval_status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {tutor.approval_status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedTutor.display_name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <p><strong>Email:</strong> {selectedTutor.email}</p>
              <p><strong>Bio:</strong> {selectedTutor.bio || 'Not provided'}</p>
              <p><strong>Qualifications:</strong> {selectedTutor.qualifications || 'None'}</p>
              <p><strong>Subjects:</strong> {selectedTutor.subjects?.join(', ') || 'None'}</p>
              <p><strong>Hourly Rate:</strong> R{selectedTutor.hourly_rate || 0}</p>
              <p><strong>Location:</strong> {selectedTutor.location || 'Not specified'}</p>
              <div><strong>ID Document:</strong> {selectedTutor.id_document_url ? <a href={selectedTutor.id_document_url} target="_blank" rel="noopener noreferrer" className="text-[#00CC99] underline">View</a> : 'Not uploaded'}</div>
              <div><strong>Transcript:</strong> {selectedTutor.transcript_url ? <a href={selectedTutor.transcript_url} target="_blank" rel="noopener noreferrer" className="text-[#00CC99] underline">View</a> : 'Not uploaded'}</div>
            </div>
            <div className="flex gap-4 mt-6">
              {selectedTutor.approval_status !== 'approved' && (
                <button onClick={() => changeStatusToApproved(selectedTutor.id)} disabled={actionLoading} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30">Approve</button>
              )}
              {selectedTutor.approval_status !== 'rejected' && (
                <button onClick={() => changeStatusToRejected(selectedTutor.id)} disabled={actionLoading} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30">Reject</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;