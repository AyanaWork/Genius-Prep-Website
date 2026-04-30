import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import documentService from '../../services/document';
import tutorRequestService from '../../services/tutorRequest';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [tutors, setTutors] = useState([]);
  const [tutorRequests, setTutorRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tutor approval modal
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Tutor request modal + shortlist picker state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [shortlist, setShortlist] = useState([]);
  const [pickedIds, setPickedIds] = useState([]);

  // Documents moderation state
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docFilter, setDocFilter] = useState('pending');
  const [previewDoc, setPreviewDoc] = useState(null);

  const token = () => localStorage.getItem('token');
  const config = () => ({ headers: { Authorization: `Bearer ${token()}` } });

  useEffect(() => { loadData(); }, [activeTab, docFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'documents') {
        const res = await documentService.adminList(docFilter);
        setPendingDocs(res.documents || []);
      } else if (activeTab === 'requests') {
        const res = await axios.get(`${API_URL}/admin/tutor-requests`, config());
        setTutorRequests(res.data.requests || []);
      } else if (activeTab === 'pending') {
        const res = await axios.get(`${API_URL}/admin/tutors/pending`, config());
        setTutors(res.data.tutors || []);
      } else {
        const res = await axios.get(`${API_URL}/admin/tutors?status=${activeTab}`, config());
        setTutors(res.data.tutors || []);
      }

      const statsRes = await axios.get(`${API_URL}/admin/stats`, config());
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ----- Tutor handlers (unchanged) -----
  const viewTutorDetails = async (tutorId) => {
    try {
      const res = await axios.get(`${API_URL}/admin/tutors/${tutorId}`, config());
      setSelectedTutor(res.data.tutor);
      setShowModal(true);
    } catch { alert('Failed to load tutor details'); }
  };

  const changeStatusToApproved = async (tutorId) => {
    if (!window.confirm('Approve this tutor?')) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/approve`, {}, config());
      alert('Tutor approved');
      setShowModal(false);
      loadData();
    } catch { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  const changeStatusToRejected = async (tutorId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/admin/tutors/${tutorId}/reject`, { reason }, config());
      alert('Tutor rejected');
      setShowModal(false);
      loadData();
    } catch { alert('Failed'); }
    finally { setActionLoading(false); }
  };

  // ----- Tutor request handlers -----
  const viewRequestDetails = async (requestId) => {
    try {
      const [reqRes, shortlistRes] = await Promise.all([
        tutorRequestService.adminGet(requestId),
        tutorRequestService.adminShortlist(requestId)
      ]);
      const req = reqRes.request;
      setSelectedRequest(req);
      setShortlist(shortlistRes.shortlist || []);
      // Pre-populate the picker with whatever the admin has already saved.
      setPickedIds((req.matched_tutor_ids || []).map(Number));
      setShowRequestModal(true);
    } catch { alert('Failed to load request'); }
  };

  const togglePicked = (tutorId) => {
    setPickedIds((prev) =>
      prev.includes(tutorId) ? prev.filter((id) => id !== tutorId) : [...prev, tutorId]
    );
  };

  // Save the picked tutors (one or many) as the shortlist.
  // Backend auto-flips status to 'matched' when at least 1 tutor is saved.
  const saveShortlist = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const res = await tutorRequestService.adminUpdate(selectedRequest.id, {
        matched_tutor_ids: pickedIds
      });
      alert(`Saved ${pickedIds.length} tutor${pickedIds.length === 1 ? '' : 's'} for the student.`);
      setSelectedRequest(res.request);
      loadData();
    } catch { alert('Failed to save shortlist'); }
    finally { setActionLoading(false); }
  };

  const updateRequestStatus = async (requestId, status) => {
    setActionLoading(true);
    try {
      await tutorRequestService.adminUpdate(requestId, { status });
      setShowRequestModal(false);
      loadData();
    } catch { alert('Failed to update'); }
    finally { setActionLoading(false); }
  };

  // ----- Document moderation handlers -----
  const approveDoc = async (id) => {
    setActionLoading(true);
    try { await documentService.adminApprove(id); setPreviewDoc(null); loadData(); }
    catch { alert('Failed to approve'); }
    finally { setActionLoading(false); }
  };
  const rejectDoc = async (id) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setActionLoading(true);
    try { await documentService.adminReject(id, reason); setPreviewDoc(null); loadData(); }
    catch { alert('Failed to reject'); }
    finally { setActionLoading(false); }
  };
  const deleteDoc = async (id) => {
    if (!window.confirm('Delete this document?')) return;
    setActionLoading(true);
    try { await documentService.adminDelete(id); setPreviewDoc(null); loadData(); }
    catch { alert('Failed to delete'); }
    finally { setActionLoading(false); }
  };

  // ----- Helpers -----
  const copyToClipboard = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    alert(`${label}: ${text}`);
  };
  const waLink = (phone) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/[^0-9+]/g, '').replace(/^\+/, '');
    return `https://wa.me/${cleaned}`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-gray-400">Manage tutors, requests, and documents</p>
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
          <div className="flex gap-4 border-b border-white/10 mb-6 flex-wrap">
            {['pending', 'approved', 'rejected', 'requests', 'documents'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-6 font-semibold transition ${activeTab === tab ? 'text-[#00CC99] border-b-2 border-[#00CC99]' : 'text-white/70 hover:text-white'}`}>
                {tab === 'requests' ? 'Tutor Requests' : tab === 'documents' ? 'Documents' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : activeTab === 'documents' ? (
            <div>
              <div className="flex gap-2 mb-4">
                {['pending', 'approved', 'rejected'].map((s) => (
                  <button key={s} onClick={() => setDocFilter(s)} className={`px-4 py-1.5 rounded-full text-sm capitalize ${docFilter === s ? 'bg-[#00CC99] text-[#0f172a] font-bold' : 'bg-[#0f172a]/40 text-white'}`}>{s}</button>
                ))}
              </div>
              {pendingDocs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No {docFilter} documents</div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingDocs.map((d) => (
                    <button key={d.id} onClick={() => setPreviewDoc(d)} className="glass-card rounded-xl p-4 text-left hover:border-[#00CC99]/40 transition">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-sm line-clamp-2">{d.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${d.status === 'approved' ? 'bg-green-500/20 text-green-400' : d.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{d.status}</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{d.doc_type}{d.module_code ? ` · ${d.module_code}` : ''}{d.year ? ` · ${d.year}` : ''}</p>
                      <p className="text-xs text-gray-500 truncate">By: {d.uploader_email || '—'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'requests' ? (
            tutorRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No tutor requests yet</div>
            ) : (
              <div className="space-y-4">
                {tutorRequests.map((req) => (
                  <div key={req.id} className="bg-[#0f172a]/5 rounded-xl p-4 hover:bg-[#0f172a]/10 transition cursor-pointer" onClick={() => viewRequestDetails(req.id)}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <h3 className="font-bold">{req.full_name} <span className="text-xs text-gray-400 font-normal">({req.requester_type})</span></h3>
                        <p className="text-sm text-gray-400">{req.email}</p>
                        {req.organisation && <p className="text-xs text-gray-500">Org: {req.organisation}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          {req.subjects?.length > 0 && `Subjects: ${req.subjects.join(', ')}`}
                          {req.module_codes?.length > 0 && ` · Modules: ${req.module_codes.join(', ')}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${req.status === 'new' ? 'bg-blue-500/20 text-blue-400' : req.status === 'reviewing' ? 'bg-yellow-500/20 text-yellow-400' : req.status === 'matched' ? 'bg-purple-500/20 text-purple-400' : req.status === 'contacted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : tutors.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No tutors found</div>
          ) : (
            <div className="space-y-4">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="bg-[#0f172a]/5 rounded-xl p-4 hover:bg-[#0f172a]/10 transition cursor-pointer" onClick={() => viewTutorDetails(tutor.id)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{tutor.display_name || tutor.email}</h3>
                      <p className="text-sm text-gray-400">{tutor.email}</p>
                      {tutor.phone_number && <p className="text-sm text-gray-300">{tutor.phone_number}</p>}
                      <p className="text-xs text-gray-500 mt-1">Subjects: {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects || 'None'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tutor.approval_status === 'approved' ? 'bg-green-500/20 text-green-400' : tutor.approval_status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{tutor.approval_status || 'pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tutor approval modal */}
      {showModal && selectedTutor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedTutor.display_name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-[#00CC99] font-semibold mb-2">Admin contact info</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong>Email:</strong> <span>{selectedTutor.email}</span>
                    <button onClick={() => copyToClipboard(selectedTutor.email, 'Email copied')} className="text-xs px-2 py-1 bg-[#00CC99]/20 text-[#00CC99] rounded">Copy</button>
                  </div>
                  {selectedTutor.phone_number ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong>Phone:</strong> <span>{selectedTutor.phone_number}</span>
                      <button onClick={() => copyToClipboard(selectedTutor.phone_number, 'Phone copied')} className="text-xs px-2 py-1 bg-[#00CC99]/20 text-[#00CC99] rounded">Copy</button>
                      <a href={waLink(selectedTutor.phone_number)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">WhatsApp</a>
                      <a href={`tel:${selectedTutor.phone_number}`} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Call</a>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-400">No phone number on file.</p>
                  )}
                </div>
              </div>
              <p><strong>Bio:</strong> {selectedTutor.bio || 'Not provided'}</p>
              <p><strong>Qualifications:</strong> {selectedTutor.qualifications || 'None'}</p>
              <p><strong>Subjects:</strong> {selectedTutor.subjects?.join(', ') || 'None'}</p>
              <p><strong>Module Codes:</strong> {selectedTutor.module_codes?.join(', ') || 'None'}</p>
              <p><strong>Hourly Rate:</strong> R{selectedTutor.hourly_rate || 0}</p>
              <p><strong>Location:</strong> {selectedTutor.location || 'Not specified'}</p>
              <div><strong>ID Document:</strong> {selectedTutor.id_document_url ? <a href={selectedTutor.id_document_url} target="_blank" rel="noopener noreferrer" className="text-[#00CC99] underline">View</a> : 'Not uploaded'}</div>
              <div><strong>Transcript:</strong> {selectedTutor.transcript_url ? <a href={selectedTutor.transcript_url} target="_blank" rel="noopener noreferrer" className="text-[#00CC99] underline">View</a> : 'Not uploaded'}</div>
            </div>
            <div className="flex gap-4 mt-6">
              {selectedTutor.approval_status !== 'approved' && (
                <button onClick={() => changeStatusToApproved(selectedTutor.id)} disabled={actionLoading} className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-xl">Approve</button>
              )}
              {selectedTutor.approval_status !== 'rejected' && (
                <button onClick={() => changeStatusToRejected(selectedTutor.id)} disabled={actionLoading} className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-xl">Reject</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutor request modal — with shortlist picker */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedRequest.full_name}</h2>
                <p className="text-sm text-gray-400 capitalize">{selectedRequest.requester_type} · {selectedRequest.status}</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wider text-[#00CC99] font-semibold mb-2">Contact</div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <strong>Email:</strong> {selectedRequest.email}
                  <button onClick={() => copyToClipboard(selectedRequest.email, 'Email copied')} className="text-xs px-2 py-1 bg-[#00CC99]/20 text-[#00CC99] rounded">Copy</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <strong>Phone:</strong> {selectedRequest.phone_number}
                  <button onClick={() => copyToClipboard(selectedRequest.phone_number, 'Phone copied')} className="text-xs px-2 py-1 bg-[#00CC99]/20 text-[#00CC99] rounded">Copy</button>
                  <a href={waLink(selectedRequest.phone_number)} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">WhatsApp</a>
                </div>
              </div>

              {selectedRequest.organisation && <p><strong>Organisation:</strong> {selectedRequest.organisation}</p>}
              {selectedRequest.education_level && <p><strong>Education level:</strong> {selectedRequest.education_level}</p>}
              {selectedRequest.institution && <p><strong>Institution:</strong> {selectedRequest.institution}</p>}
              {selectedRequest.subjects?.length > 0 && <p><strong>Subjects:</strong> {selectedRequest.subjects.join(', ')}</p>}
              {selectedRequest.module_codes?.length > 0 && <p><strong>Module codes:</strong> {selectedRequest.module_codes.join(', ')}</p>}
              {selectedRequest.budget_per_hour && <p><strong>Budget:</strong> R{selectedRequest.budget_per_hour}/hr</p>}
              {selectedRequest.preferred_format && <p><strong>Format:</strong> {selectedRequest.preferred_format}</p>}
              {selectedRequest.location && <p><strong>Location:</strong> {selectedRequest.location}</p>}
              <p><strong>Number of students:</strong> {selectedRequest.number_of_students}</p>
              {selectedRequest.notes && <p><strong>Notes:</strong> {selectedRequest.notes}</p>}

              {/* Shortlist picker */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Pick tutors for this student ({pickedIds.length} selected)</h3>
                  <button
                    onClick={saveShortlist}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving…' : 'Save shortlist'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Tick one tutor for a single match, or several to send a shortlist. Saving auto-flips status to "matched" and the student sees the picks under "My Requests".
                </p>

                {shortlist.length === 0 ? (
                  <p className="text-gray-400 text-sm">No matching tutors found. Try widening the request criteria, or save with no picks to leave the request open.</p>
                ) : (
                  <div className="space-y-2">
                    {shortlist.map((t) => {
                      const checked = pickedIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={`w-full flex items-center gap-3 rounded-lg p-3 cursor-pointer transition ${
                            checked ? 'bg-[#00CC99]/15 border border-[#00CC99]/40' : 'bg-[#0f172a]/30 hover:bg-[#0f172a]/50 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePicked(t.id)}
                            className="w-4 h-4 accent-[#00CC99]"
                          />
                          <div className="w-10 h-10 rounded-full bg-[#00CC99]/20 flex items-center justify-center text-[#00CC99] font-bold shrink-0">
                            {t.display_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {t.display_name}
                              {t.is_elite && <span className="ml-2 text-yellow-400 text-xs">★ Elite</span>}
                            </p>
                            <p className="text-xs text-gray-400">
                              R{t.hourly_rate || 0}/hr · ⭐ {parseFloat(t.average_rating || 0).toFixed(1)} ({t.review_count || 0})
                            </p>
                            {t.module_codes?.length > 0 && <p className="text-xs text-yellow-300 font-mono truncate">{t.module_codes.slice(0, 4).join(' · ')}</p>}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); navigate(`/tutors/${t.id}`); }}
                            className="text-xs text-[#00CC99] hover:underline shrink-0"
                          >
                            View →
                          </button>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              {['reviewing', 'matched', 'contacted', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateRequestStatus(selectedRequest.id, status)}
                  disabled={actionLoading || selectedRequest.status === status}
                  className="px-4 py-2 bg-[#00CC99]/20 text-[#00CC99] rounded-lg disabled:opacity-30 capitalize"
                >Mark {status}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document preview/moderation modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-[#0f172a] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="min-w-0 pr-3">
                <h3 className="text-lg font-bold truncate">{previewDoc.title}</h3>
                <p className="text-xs text-gray-400">
                  {previewDoc.doc_type}{previewDoc.module_code ? ` · ${previewDoc.module_code}` : ''}
                  {previewDoc.year ? ` · ${previewDoc.year}` : ''}
                  {previewDoc.uploader_email ? ` · ${previewDoc.uploader_email}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a href={previewDoc.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#00CC99]/20 text-[#00CC99] rounded-lg text-sm">Open</a>
                <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-white px-2">✕</button>
              </div>
            </div>
            <div className="flex-1 bg-black/40 overflow-auto">
              {previewDoc.mime_type === 'application/pdf' ? (
                <iframe title={previewDoc.title} src={previewDoc.file_url} className="w-full h-[70vh]" />
              ) : (previewDoc.mime_type || '').startsWith('image/') ? (
                <img src={previewDoc.file_url} alt={previewDoc.title} className="max-w-full max-h-[70vh] mx-auto" />
              ) : (
                <div className="p-8 text-center text-gray-400">
                  Inline preview not supported. <a href={previewDoc.file_url} target="_blank" rel="noopener noreferrer" className="text-[#00CC99] underline">Open file</a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2 flex-wrap">
              {previewDoc.status !== 'approved' && (
                <button onClick={() => approveDoc(previewDoc.id)} disabled={actionLoading} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">Approve</button>
              )}
              {previewDoc.status !== 'rejected' && (
                <button onClick={() => rejectDoc(previewDoc.id)} disabled={actionLoading} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Reject</button>
              )}
              <button onClick={() => deleteDoc(previewDoc.id)} disabled={actionLoading} className="ml-auto px-4 py-2 bg-red-500/30 text-red-300 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
