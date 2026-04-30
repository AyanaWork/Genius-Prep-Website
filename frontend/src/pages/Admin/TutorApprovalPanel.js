import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function TutorApprovalPanel() {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => { fetchPendingTutors(); }, []);

  const fetchPendingTutors = async () => {
    try { const res = await api.get('/admin/tutors/pending'); setPendingTutors(res.data.tutors); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  const handleApprove = async (tutorId) => {
    if (!window.confirm('Approve this tutor?')) return;
    try { await api.put(`/admin/tutors/${tutorId}/approve`); alert('Approved'); fetchPendingTutors(); setSelectedTutor(null); }
    catch (err) { alert('Failed'); }
  };
  const handleReject = async (tutorId) => {
    if (!rejectionReason.trim()) return alert('Please provide a reason');
    try { await api.put(`/admin/tutors/${tutorId}/reject`, { reason: rejectionReason }); alert('Rejected'); fetchPendingTutors(); setSelectedTutor(null); setRejectionReason(''); }
    catch (err) { alert('Failed'); }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <img src={companyLogo} alt="Logo" className="h-10 w-auto" />
          <h1 className="text-3xl md:text-4xl font-black text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Tutor Approval Panel</h1>
        </div>
        {pendingTutors.length === 0 ? <div className="glass-card rounded-3xl p-8 text-center">No pending applications</div> : (
          <div className="space-y-6">
            {pendingTutors.map(tutor => (
              <div key={tutor.id} className="glass-card rounded-3xl p-6">
                <div className="flex justify-between items-start">
                  <div><h2 className="text-xl font-bold">{tutor.display_name || tutor.email}</h2><p className="text-gray-400">{tutor.email}</p></div>
                  {tutor.profile_picture_url && <img src={tutor.profile_picture_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#00CC99]" />}
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div><strong>Subjects:</strong> {tutor.subjects?.join(', ') || 'None'}</div><div><strong>Experience:</strong> {tutor.years_experience || 0} years</div>
                  <div><strong>Qualifications:</strong> {tutor.qualifications || 'None'}</div><div><strong>Hourly Rate:</strong> R{tutor.hourly_rate || 0}</div>
                </div>
                <div className="mt-4"><strong>Bio:</strong> <p className="text-gray-300">{tutor.bio || 'No bio'}</p></div>
                <div className="mt-4 flex gap-4">
                  <a href={tutor.id_document_url} target="_blank" className="text-[#00CC99] underline">View ID</a>
                  <a href={tutor.transcript_url} target="_blank" className="text-[#00CC99] underline">View Transcript</a>
                </div>
                {selectedTutor === tutor.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full bg-[#0f172a]/5 border border-white/10 rounded-xl p-3" rows="3" placeholder="Reason for rejection..." />
                    <div className="flex gap-3">
                      <button onClick={() => handleReject(tutor.id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl">Confirm Reject</button>
                      <button onClick={() => setSelectedTutor(null)} className="px-4 py-2 glass-card rounded-xl">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => handleApprove(tutor.id)} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl">Approve</button>
                    <button onClick={() => setSelectedTutor(tutor.id)} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TutorApprovalPanel;