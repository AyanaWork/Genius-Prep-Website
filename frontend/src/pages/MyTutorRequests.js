import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorRequestService from '../services/tutorRequest';
import authService from '../services/auth';

const STATUS_LABEL = {
  new: 'Submitted',
  reviewing: 'Under review',
  matched: 'Tutors shortlisted',
  contacted: 'Admin reached out',
  closed: 'Closed'
};

const STATUS_COLOR = {
  new: 'bg-blue-500/20 text-blue-400',
  reviewing: 'bg-yellow-500/20 text-yellow-400',
  matched: 'bg-purple-500/20 text-purple-400',
  contacted: 'bg-emerald-500/20 text-emerald-400',
  closed: 'bg-gray-500/20 text-gray-400'
};

function RequestCard({ request, onView }) {
  const matchedCount = request.matched_tutors?.length || 0;
  return (
    <button
      type="button"
      onClick={() => onView(request)}
      className="w-full text-left glass-card rounded-2xl p-5 hover:scale-[1.01] hover:border-[#00CC99]/40 transition"
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-bold text-white">
            {request.subjects?.length > 0
              ? request.subjects.slice(0, 3).join(', ')
              : 'Tutor request'}
          </p>
          <p className="text-xs text-gray-400">
            Submitted {new Date(request.created_at).toLocaleDateString()}
            {request.module_codes?.length > 0 && ` · Modules: ${request.module_codes.join(', ')}`}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLOR[request.status] || 'bg-white/10 text-white'}`}>
          {STATUS_LABEL[request.status] || request.status}
        </span>
      </div>
      {request.notes && <p className="text-sm text-gray-400 line-clamp-2">{request.notes}</p>}
      <div className="text-xs text-[#00CC99] mt-3">
        {matchedCount > 0 ? `${matchedCount} matched tutor${matchedCount === 1 ? '' : 's'} — tap to view` : 'View details →'}
      </div>
    </button>
  );
}

function MatchedTutorsList({ tutors, onPick }) {
  if (!tutors || tutors.length === 0) {
    return <p className="text-sm text-gray-400">No tutors have been matched yet. Our team is reviewing your request.</p>;
  }
  return (
    <div className="space-y-2">
      {tutors.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onPick(t)}
          className="w-full text-left bg-[#0f172a]/30 hover:bg-[#0f172a]/50 rounded-lg p-3 flex items-center gap-3 transition"
        >
          {t.profile_picture_url ? (
            <img src={t.profile_picture_url} alt={t.display_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#00CC99]/20 flex items-center justify-center text-[#00CC99] font-bold">
              {t.display_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {t.display_name}
              {t.is_elite && <span className="ml-2 text-yellow-400 text-xs">★ Elite</span>}
            </p>
            <p className="text-xs text-gray-400">
              R{t.hourly_rate || 0}/hr · ⭐ {parseFloat(t.average_rating || 0).toFixed(1)} ({t.review_count || 0})
            </p>
            {t.module_codes?.length > 0 && (
              <p className="text-xs text-yellow-300 font-mono truncate">{t.module_codes.slice(0, 4).join(' · ')}</p>
            )}
          </div>
          <span className="text-[#00CC99] text-sm">View →</span>
        </button>
      ))}
    </div>
  );
}

function RequestDetailModal({ request, onClose, onPickTutor }) {
  if (!request) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your tutor request</h2>
            <p className="text-sm text-gray-400">
              Status: <span className={`px-2 py-0.5 rounded ${STATUS_COLOR[request.status]}`}>{STATUS_LABEL[request.status]}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-2 text-sm mb-6">
          {request.subjects?.length > 0 && <p><strong>Subjects:</strong> {request.subjects.join(', ')}</p>}
          {request.module_codes?.length > 0 && <p><strong>Module codes:</strong> {request.module_codes.join(', ')}</p>}
          {request.education_level && <p><strong>Level:</strong> {request.education_level}</p>}
          {request.institution && <p><strong>Institution:</strong> {request.institution}</p>}
          {request.preferred_format && <p><strong>Format:</strong> {request.preferred_format}</p>}
          {request.budget_per_hour && <p><strong>Budget:</strong> R{request.budget_per_hour}/hr</p>}
          {request.location && <p><strong>Location:</strong> {request.location}</p>}
          {request.notes && <p><strong>Notes:</strong> {request.notes}</p>}
        </div>

        <h3 className="font-bold mb-3">
          {request.matched_tutors?.length > 0
            ? `Tutors picked for you (${request.matched_tutors.length})`
            : 'Matched tutors'}
        </h3>
        <MatchedTutorsList tutors={request.matched_tutors} onPick={onPickTutor} />

        <p className="text-xs text-gray-500 mt-4">
          {request.matched_tutors?.length > 0
            ? 'Tap any tutor above to view their full profile and book a session.'
            : 'When the admin team finishes matching, the shortlist appears here.'}
        </p>
      </div>
    </div>
  );
}

function MyTutorRequests() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tutorRequestService.listMine();
      setRequests(res.requests || []);
    } catch (e) {
      const data = e?.response?.data;
      if (e?.response?.status === 503) {
        setError(data?.message || 'Tutor request system is not set up yet.');
      } else {
        setError('Could not load your requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  if (!currentUser) {
    return (<div className="px-6 pt-24 pb-12 text-center"><p className="text-gray-400">Please sign in to see your tutor requests.</p></div>);
  }

  return (
    <div className="container mx-auto px-6 pt-24 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">My Tutor Requests</h1>
        <p className="text-gray-400">Track requests you've submitted and see the tutors our team has matched.</p>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/request-tutor')} className="px-5 py-2.5 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">
          + New request
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-gray-400 max-w-xl mx-auto">{error}</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">📨</div>
          <h2 className="text-xl font-bold mb-2">No requests yet</h2>
          <p className="text-gray-400 mb-5">Submit a request and our team will hand-pick tutors for you.</p>
          <button onClick={() => navigate('/request-tutor')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold">
            Submit a request
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {requests.map((r) => <RequestCard key={r.id} request={r} onView={setSelected} />)}
        </div>
      )}

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onPickTutor={(t) => { setSelected(null); navigate(`/tutors/${t.id}`); }}
      />
    </div>
  );
}

export default MyTutorRequests;
