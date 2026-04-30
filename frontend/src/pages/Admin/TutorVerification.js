import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function TutorVerification() {
  const navigate = useNavigate();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [filter, setFilter] = useState('pending');

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'all' ? '/api/admin/tutors/all' : `/api/admin/tutors/all?status=${filter}`;
      const tutorsRes = await axios.get(endpoint);
      setPendingTutors(tutorsRes.data.tutors);
      const statsRes = await axios.get('/api/admin/tutors/verification-stats');
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleApprove = async (tutorProfileId) => {
    if (!window.confirm('Approve this tutor?')) return;
    setProcessing(true);
    try { await axios.post(`/api/admin/tutors/${tutorProfileId}/approve`, { notes: actionNotes }); alert('Approved'); await loadData(); setSelectedTutor(null); setActionNotes(''); }
    catch (err) { alert('Failed'); }
    finally { setProcessing(false); }
  };
  const handleReject = async (tutorProfileId) => {
    if (!actionNotes.trim()) return alert('Please provide a reason');
    if (!window.confirm('Reject this tutor?')) return;
    setProcessing(true);
    try { await axios.post(`/api/admin/tutors/${tutorProfileId}/reject`, { reason: actionNotes }); alert('Rejected'); await loadData(); setSelectedTutor(null); setActionNotes(''); }
    catch (err) { alert('Failed'); }
    finally { setProcessing(false); }
  };

  const getStatusBadge = (status) => {
    const classes = { pending: 'bg-yellow-500/20 text-yellow-400', approved: 'bg-green-500/20 text-green-400', rejected: 'bg-red-500/20 text-red-400' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${classes[status] || 'bg-gray-500/20'}`}>{status}</span>;
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={companyLogo} alt="Logo" className="h-10 w-auto" />
            <h1 className="text-3xl md:text-4xl font-black text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Tutor Verification</h1>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="text-[#00CC99] hover:underline">← Back to Dashboard</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-[#00CC99]">{stats.total}</div><div className="text-xs text-gray-400">Total</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-yellow-400">{stats.pending}</div><div className="text-xs text-gray-400">Pending</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-green-400">{stats.approved}</div><div className="text-xs text-gray-400">Approved</div></div>
          <div className="glass-card rounded-xl p-4 text-center"><div className="text-2xl font-bold text-red-400">{stats.rejected}</div><div className="text-xs text-gray-400">Rejected</div></div>
        </div>

        {/* Filter tabs */}
        <div className="glass-card rounded-3xl p-2 mb-8 flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 rounded-xl transition ${filter === f ? 'bg-[#00CC99] text-[#0f172a] font-bold' : 'hover:bg-[#0f172a]/10'}`}>{f.toUpperCase()}</button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* List */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Tutors ({pendingTutors.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {pendingTutors.map(tutor => (
                <div key={tutor.id} onClick={() => setSelectedTutor(tutor)} className={`p-4 rounded-xl cursor-pointer transition ${selectedTutor?.id === tutor.id ? 'bg-[#00CC99]/20 border border-[#00CC99]' : 'bg-[#0f172a]/5 hover:bg-[#0f172a]/10'}`}>
                  <div className="flex justify-between"><strong>{tutor.display_name}</strong>{getStatusBadge(tutor.verification_status)}</div>
                  <div className="text-sm text-gray-400">{tutor.email}</div>
                  <div className="text-xs text-gray-500 mt-1">R{tutor.hourly_rate}/hr · {tutor.subjects?.length || 0} subjects</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="glass-card rounded-3xl p-6">
            {selectedTutor ? (
              <>
                <h2 className="text-xl font-bold mb-4">Review Application</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedTutor.profile_picture_url && <img src={selectedTutor.profile_picture_url} className="w-24 h-24 rounded-full object-cover border-2 border-[#00CC99]" alt="" />}
                  <div><strong>Name:</strong> {selectedTutor.display_name}</div><div><strong>Email:</strong> {selectedTutor.email}</div>
                  <div><strong>Bio:</strong> {selectedTutor.bio || 'None'}</div>
                  <div><strong>Qualifications:</strong> {selectedTutor.qualifications || 'None'}</div>
                  <div><strong>Subjects:</strong> {selectedTutor.subjects?.join(', ') || 'None'}</div>
                  <div><strong>Experience:</strong> {selectedTutor.years_experience || 0} years</div>
                  <div><strong>Hourly Rate:</strong> R{selectedTutor.hourly_rate}</div>
                  <div><strong>Teaching Mode:</strong> {selectedTutor.teaching_mode}</div>
                  <div><strong>Location:</strong> {selectedTutor.location}</div>
                  <div><strong>ID Document:</strong> {selectedTutor.id_document_url ? <a href={selectedTutor.id_document_url} target="_blank" className="text-[#00CC99] underline">View</a> : <span className="text-red-400">Missing</span>}</div>
                  <div><strong>Transcript:</strong> {selectedTutor.transcript_url ? <a href={selectedTutor.transcript_url} target="_blank" className="text-[#00CC99] underline">View</a> : <span className="text-red-400">Missing</span>}</div>

                  {selectedTutor.verification_status === 'pending' && (
                    <>
                      <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} className="w-full bg-[#0f172a]/5 border border-white/10 rounded-xl p-3" rows="3" placeholder="Admin notes (required for rejection)..." />
                      <div className="flex gap-3">
                        <button onClick={() => handleApprove(selectedTutor.id)} disabled={processing || !selectedTutor.id_document_url || !selectedTutor.transcript_url} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl disabled:opacity-50">Approve</button>
                        <button onClick={() => handleReject(selectedTutor.id)} disabled={processing} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl">Reject</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">Select a tutor to review</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorVerification;