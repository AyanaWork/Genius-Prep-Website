import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import documentService from '../services/document';
import authService from '../services/auth';

const TYPE_LABEL = {
  past_paper: 'Past paper', notes: 'Notes', memo: 'Memo',
  tutorial: 'Tutorial', other: 'Other'
};
const TYPE_ICON = {
  past_paper: '📝', notes: '📒', memo: '🗒️', tutorial: '🎯', other: '📎'
};
const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'past_paper', label: 'Past papers' },
  { value: 'notes', label: 'Notes' },
  { value: 'memo', label: 'Memos' },
  { value: 'tutorial', label: 'Tutorials' },
  { value: 'other', label: 'Other' }
];
const SUBJECT_OPTIONS = [
  '', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Accounting', 'Economics', 'Computer Science', 'Statistics', 'Law',
  'Psychology', 'Programming', 'Finance'
];

function isPdf(mime) { return mime === 'application/pdf'; }
function isImage(mime) { return typeof mime === 'string' && mime.startsWith('image/'); }

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

// Shared preview modal — admin pass `actions` for moderation buttons.
function PreviewModal({ doc, onClose, actions }) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f172a] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="min-w-0 pr-3">
            <h3 className="text-lg font-bold truncate">{doc.title}</h3>
            <p className="text-xs text-gray-400">
              {TYPE_LABEL[doc.doc_type]}{doc.module_code ? ` · ${doc.module_code}` : ''}{doc.year ? ` · ${doc.year}` : ''}
              {doc.uploader_email ? ` · uploaded by ${doc.uploader_email}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#00CC99]/20 text-[#00CC99] rounded-lg text-sm">Open in tab</a>}
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
          </div>
        </div>
        <div className="flex-1 bg-black/40 overflow-auto">
          {!doc.file_url ? (
            <div className="p-8 text-center text-gray-400">No preview URL — make sure the Supabase "documents" bucket is public.</div>
          ) : isPdf(doc.mime_type) ? (
            <iframe title={doc.title} src={doc.file_url} className="w-full h-[70vh]" />
          ) : isImage(doc.mime_type) ? (
            <img src={doc.file_url} alt={doc.title} className="max-w-full max-h-[70vh] mx-auto" />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p className="mb-3">Inline preview isn't supported for this file type.</p>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold inline-block">Download to view</a>
            </div>
          )}
        </div>
        {actions && <div className="p-4 border-t border-white/10 flex gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

// =====================================================================
// Upload form (students + tutors)
// =====================================================================
function UploadCard({ onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    docType: 'past_paper', subject: '', moduleCode: '', institution: '',
    year: '', semester: '', title: '', description: ''
  });
  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    if (!file) return setErr('Choose a file to upload');
    if (form.title.trim().length < 3) return setErr('Title needs at least 3 characters');
    setSubmitting(true);
    try {
      await documentService.upload({ file, ...form });
      setMsg('Uploaded! Awaiting admin review. Once one of your uploads is approved you unlock the full library.');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setForm({ docType: 'past_paper', subject: '', moduleCode: '', institution: '', year: '', semester: '', title: '', description: '' });
      if (onUploaded) onUploaded();
    } catch (e2) {
      const data = e2.response?.data;
      setErr(data?.message || data?.error || data?.details || 'Upload failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-6 border border-white/10">
      <h3 className="text-xl font-bold mb-1">Upload a study resource</h3>
      <p className="text-sm text-gray-400 mb-4">Files go through admin review before they appear in the library.</p>
      {err && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-3">{err}</div>}
      {msg && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-xl mb-3">{msg}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Type *</label>
            <select value={form.docType} onChange={(e) => update('docType', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white">
              <option value="past_paper">Past paper</option>
              <option value="notes">Notes</option>
              <option value="memo">Memo</option>
              <option value="tutorial">Tutorial</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="e.g. FRK300 Exam 2024 S2" required />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Module code</label>
            <input type="text" value={form.moduleCode} onChange={(e) => update('moduleCode', e.target.value.toUpperCase())} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="FRK300" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <select value={form.subject} onChange={(e) => update('subject', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white">
              {SUBJECT_OPTIONS.map((s) => (<option key={s} value={s}>{s || 'Select…'}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Institution</label>
            <input type="text" value={form.institution} onChange={(e) => update('institution', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="e.g. UP" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Year</label>
            <input type="number" min="2000" max="2099" value={form.year} onChange={(e) => update('year', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="2024" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Semester</label>
            <input type="text" value={form.semester} onChange={(e) => update('semester', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="S1, S2, Mid-year" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">File *</label>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.pptx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded-lg file:bg-[#00CC99]/20 file:text-[#00CC99] file:border-0 file:cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description (optional)</label>
          <textarea rows="2" value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="Anything that helps other students find or use this resource" />
        </div>
        <button type="submit" disabled={submitting} className="w-full md:w-auto px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">{submitting ? 'Uploading…' : 'Upload'}</button>
      </form>
    </div>
  );
}

function MyUploadsList({ items, onPreview, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center text-gray-400 border border-white/10 mb-6">
        You haven't uploaded any documents yet.
      </div>
    );
  }
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
      <h3 className="text-lg font-bold mb-3">Your uploads ({items.length})</h3>
      <p className="text-xs text-gray-500 mb-3">Click an approved upload to preview it. 🗑 to delete.</p>
      <div className="space-y-2">
        {items.map((d) => {
          const clickable = d.status === 'approved';
          return (
            <div key={d.id} className="flex items-center justify-between bg-[#0f172a]/40 rounded-lg p-3 gap-3 border border-white/10">
              <button
                type="button"
                disabled={!clickable}
                onClick={clickable ? () => onPreview(d) : undefined}
                className={`flex-1 min-w-0 text-left ${clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                <p className="font-semibold truncate">{TYPE_ICON[d.doc_type]} {d.title}</p>
                <p className="text-xs text-gray-400 truncate">
                  {d.module_code || '—'} · {TYPE_LABEL[d.doc_type]}
                  {d.rejection_reason ? ` · Reason: ${d.rejection_reason}` : ''}
                </p>
              </button>
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap border ${
                d.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40'
                : d.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
              }`}>{d.status}</span>
              <button type="button" onClick={() => onDelete(d)} className="px-2 py-1 text-red-400 hover:bg-red-500/10 rounded-lg" title="Delete">🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// Library — visible once unlocked. Includes search + filters.
// =====================================================================
function LibraryView({ onPreview }) {
  const [docs, setDocs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({ docType: '', subject: '', moduleCode: '', sort: 'newest' });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [moduleCodes, setModuleCodes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    documentService.getModuleCodes()
      .then((r) => setModuleCodes(r.moduleCodes || []))
      .catch(() => setModuleCodes([]));
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setPage(1); }, [filters.docType, filters.subject, filters.moduleCode, filters.sort, debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await documentService.list({ ...filters, q: debouncedSearch.trim() || undefined, page, limit: 24 });
        if (cancelled) return;
        setDocs(res.documents || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || 'Failed to load documents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [filters, debouncedSearch, page]);

  const codeSuggestions = useMemo(() => {
    const t = searchInput.trim().toUpperCase();
    if (!t) return [];
    return moduleCodes.filter((c) => c.includes(t)).slice(0, 8);
  }, [searchInput, moduleCodes]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 mb-6">
      <h3 className="text-lg font-bold mb-3">Document library</h3>

      {/* Search */}
      <div className="relative mb-4" ref={searchBoxRef}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search title, module code, subject…"
          className="w-full pl-11 pr-10 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-gray-500"
        />
        <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        {searchInput && (
          <button type="button" onClick={() => setSearchInput('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">×</button>
        )}
        {showSuggestions && codeSuggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl overflow-hidden">
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#334155]">Module codes</div>
            {codeSuggestions.map((c) => (
              <button key={c} type="button" onClick={() => { setSearchInput(c); setShowSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-[#00CC99]/10 text-white">
                <span className="font-semibold text-[#00CC99]">{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-3 mb-5">
        <select value={filters.docType} onChange={(e) => setFilters({ ...filters, docType: e.target.value })} className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white">
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white">
          {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All subjects'}</option>)}
        </select>
        <input type="text" value={filters.moduleCode} onChange={(e) => setFilters({ ...filters, moduleCode: e.target.value.toUpperCase() })} className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white" placeholder="Module code (e.g. FRK300)" />
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white">
          <option value="newest">Newest</option>
          <option value="popular">Most viewed</option>
          <option value="year_desc">Year (newest first)</option>
        </select>
      </div>

      <div className="mb-3 text-sm text-gray-400">
        {loading ? 'Loading…' : `${total} document${total === 1 ? '' : 's'}`}
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{error}</div>}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => (<div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />))}</div>
      ) : docs.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No documents match those filters.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <button key={d.id} onClick={() => onPreview(d)} className="glass-card rounded-2xl p-5 text-left border border-white/10 hover:scale-[1.02] hover:border-[#00CC99]/40 transition">
              <div className="text-3xl mb-2">{TYPE_ICON[d.doc_type] || '📄'}</div>
              <h4 className="font-bold text-white line-clamp-2 mb-2">{d.title}</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs px-2 py-0.5 bg-[#00CC99]/10 text-[#00CC99] rounded">{TYPE_LABEL[d.doc_type]}</span>
                {d.module_code && <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-300 font-mono rounded">{d.module_code}</span>}
                {d.year && <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-300 rounded">{d.year}</span>}
              </div>
              {d.description && <p className="text-sm text-gray-400 line-clamp-2">{d.description}</p>}
              <div className="text-xs text-gray-500 mt-3 flex justify-between"><span>{d.subject || ''}</span><span>👁 {d.view_count || 0}</span></div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30">← Prev</button>
          <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Locked screen — explains how to unlock
// =====================================================================
function LockedView({ status, isTutor }) {
  const isPending = status?.reason === 'pending_upload';
  return (
    <div className="glass-card rounded-2xl p-8 text-center border border-white/10 mb-6">
      <div className="text-5xl mb-3">🔒</div>
      <h2 className="text-2xl font-bold mb-2">Library locked</h2>
      <p className="text-gray-400 mb-4 max-w-xl mx-auto">
        {isTutor && status?.reason === 'tutor_pending_approval' && 'Your tutor profile is awaiting admin approval. The library unlocks as soon as you\'re approved.'}
        {isTutor && status?.reason === 'tutor_rejected' && 'Your tutor profile was not approved. Update your profile and resubmit to gain access.'}
        {!isTutor && status?.reason === 'no_upload' && 'Upload at least one past paper, set of notes, or memo to unlock the full library and see what other students have shared.'}
        {!isTutor && isPending && 'Your uploads are awaiting admin approval. The library unlocks as soon as one of them is approved.'}
      </p>
      {!isTutor && (
        <p className="text-xs text-gray-500">
          Required: {status?.requiredApprovedUploads ?? 1} approved upload — you have{' '}
          <span className="text-[#00CC99] font-semibold">{status?.approvedUploads ?? 0}</span> approved
          {' '}({status?.totalUploads ?? 0} total submitted)
        </p>
      )}
    </div>
  );
}

// =====================================================================
// Admin variant (existing)
// =====================================================================
function AdminDocumentsView({ refreshKey, onPreview }) {
  const [filter, setFilter] = useState('pending');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await documentService.adminList(filter);
      setDocs(res.documents || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load documents');
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load, refreshKey]);

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h3 className="text-lg font-bold">Student / tutor uploads</h3>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm capitalize border ${
                filter === s
                  ? 'bg-[#00CC99] text-[#0f172a] font-bold border-[#00CC99]'
                  : 'bg-[#0f172a]/40 text-white border-white/10 hover:border-white/30'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-3">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No {filter} documents.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <button key={d.id} onClick={() => onPreview(d)} className="glass-card rounded-xl p-4 text-left border border-white/10 hover:border-[#00CC99]/50 transition">
              <div className="flex items-start justify-between mb-2 gap-2">
                <h4 className="font-bold text-sm line-clamp-2">{TYPE_ICON[d.doc_type]} {d.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border ${
                  d.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/40'
                  : d.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                }`}>{d.status}</span>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {TYPE_LABEL[d.doc_type]}{d.module_code ? ` · ${d.module_code}` : ''}{d.year ? ` · ${d.year}` : ''}
              </p>
              <p className="text-xs text-gray-500 truncate">By: {d.uploader_email || '—'}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Page
// =====================================================================
function Documents() {
  const currentUser = authService.getCurrentUser();
  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const isTutor = role === 'tutor';

  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState('');
  const [status, setStatus] = useState(null);
  const [myUploads, setMyUploads] = useState([]);

  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewKind, setPreviewKind] = useState(null); // 'admin' | other
  const [adminRefreshKey, setAdminRefreshKey] = useState(0);
  const [modActionLoading, setModActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSetupError('');
    try {
      // Status drives unlocked vs locked.
      const s = await documentService.getMyStatus();
      setStatus(s);
      // Students AND tutors can upload, so always fetch their list.
      if (!isAdmin) {
        const my = await documentService.listMyUploads();
        setMyUploads(my.documents || []);
      }
    } catch (e) {
      const data = e?.response?.data;
      if (e?.response?.status === 503 && data?.error === 'documents_table_missing') {
        setSetupError(data.message || 'Documents library is not set up yet.');
      } else {
        setSetupError('Could not load documents. Please try again later.');
      }
    } finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { refresh(); }, [refresh]);

  const handlePreview = async (doc) => {
    setPreviewKind('user');
    try {
      const res = await documentService.getOne(doc.id);
      setPreviewDoc(res.document || doc);
    } catch { setPreviewDoc(doc); }
  };
  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      await documentService.deleteMyUpload(doc.id);
      refresh();
    } catch (e) { alert(e.response?.data?.error || 'Failed to delete'); }
  };

  // Admin moderation handlers
  const handleAdminPreview = (doc) => { setPreviewKind('admin'); setPreviewDoc(doc); };
  const adminApprove = async () => {
    if (!previewDoc) return;
    setModActionLoading(true);
    try {
      await documentService.adminApprove(previewDoc.id);
      setPreviewDoc(null);
      setAdminRefreshKey((k) => k + 1);
    } catch { alert('Failed to approve'); }
    finally { setModActionLoading(false); }
  };
  const adminReject = async () => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    setModActionLoading(true);
    try {
      await documentService.adminReject(previewDoc.id, reason);
      setPreviewDoc(null);
      setAdminRefreshKey((k) => k + 1);
    } catch { alert('Failed to reject'); }
    finally { setModActionLoading(false); }
  };
  const adminDelete = async () => {
    if (!window.confirm('Delete this document? This will also remove it from the uploader\'s account.')) return;
    setModActionLoading(true);
    try {
      await documentService.adminDelete(previewDoc.id);
      setPreviewDoc(null);
      setAdminRefreshKey((k) => k + 1);
    } catch { alert('Failed to delete'); }
    finally { setModActionLoading(false); }
  };

  if (!currentUser) {
    return (<div className="px-6 pt-24 pb-12 text-center"><p className="text-gray-400">Please sign in to access documents.</p></div>);
  }

  const adminActions = previewKind === 'admin' && previewDoc ? (
    <>
      {previewDoc.status !== 'approved' && (
        <button onClick={adminApprove} disabled={modActionLoading} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/40">Approve</button>
      )}
      {previewDoc.status !== 'rejected' && (
        <button onClick={adminReject} disabled={modActionLoading} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/40">Reject</button>
      )}
      <button onClick={adminDelete} disabled={modActionLoading} className="ml-auto px-4 py-2 bg-red-500/30 text-red-300 rounded-lg border border-red-500/50">Delete</button>
    </>
  ) : null;

  return (
    <div className="container mx-auto px-6 pt-24 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
          {isAdmin ? 'Student Documents' : 'Document Library'}
        </h1>
        <p className="text-gray-400">
          {isAdmin
            ? 'Approve, reject, or delete documents uploaded by students and tutors.'
            : 'Past papers, notes, and memos. Share to unlock the full library.'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : setupError ? (
        <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
          <div className="text-4xl mb-3">🔧</div>
          <h2 className="text-xl font-bold mb-2">Documents library not ready</h2>
          <p className="text-gray-400 max-w-xl mx-auto">{setupError}</p>
        </div>
      ) : isAdmin ? (
        <AdminDocumentsView refreshKey={adminRefreshKey} onPreview={handleAdminPreview} />
      ) : (
        <>
          {!status?.unlocked && <LockedView status={status} isTutor={isTutor} />}
          {status?.unlocked && <LibraryView onPreview={handlePreview} />}
          <UploadCard onUploaded={refresh} />
          <MyUploadsList items={myUploads} onPreview={handlePreview} onDelete={handleDelete} />
        </>
      )}

      <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} actions={adminActions} />
    </div>
  );
}

export default Documents;
