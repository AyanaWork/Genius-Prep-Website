import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import documentService from '../services/document';
import authService from '../services/auth';

/**
 * Documents library
 * -----------------
 * "Give-to-get" rule: a student must have at least one APPROVED upload
 * of their own before they can browse the library. Until that, the
 * page renders an upload-only view.
 *
 * Admins always see the library.
 */

const TYPE_LABEL = {
  past_paper: 'Past paper',
  notes: 'Notes',
  memo: 'Memo',
  tutorial: 'Tutorial',
  other: 'Other'
};

const TYPE_ICON = {
  past_paper: '📝',
  notes: '📒',
  memo: '🗒️',
  tutorial: '🎯',
  other: '📎'
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

function useDebouncedValue(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

function isPdf(mime) { return mime === 'application/pdf'; }
function isImage(mime) { return typeof mime === 'string' && mime.startsWith('image/'); }

function PreviewModal({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold">{doc.title}</h3>
            <p className="text-xs text-gray-400">
              {TYPE_LABEL[doc.doc_type]}{doc.module_code ? ` · ${doc.module_code}` : ''}
              {doc.year ? ` · ${doc.year}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={doc.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#00CC99]/20 text-[#00CC99] rounded-lg text-sm"
            >
              Open in tab
            </a>
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
          </div>
        </div>
        <div className="flex-1 bg-black/40 overflow-auto">
          {isPdf(doc.mime_type) ? (
            <iframe
              title={doc.title}
              src={doc.file_url}
              className="w-full h-[80vh]"
            />
          ) : isImage(doc.mime_type) ? (
            <img
              src={doc.file_url}
              alt={doc.title}
              className="max-w-full max-h-[80vh] mx-auto"
            />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p className="mb-3">Inline preview isn't supported for this file type.</p>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold inline-block"
              >
                Download to view
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadCard({ onUploaded }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    docType: 'past_paper',
    subject: '',
    moduleCode: '',
    institution: '',
    year: '',
    semester: '',
    title: '',
    description: ''
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
      setMsg('Uploaded! Awaiting admin review. You\'ll unlock the library once it\'s approved.');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      setForm({
        docType: 'past_paper', subject: '', moduleCode: '', institution: '',
        year: '', semester: '', title: '', description: ''
      });
      if (onUploaded) onUploaded();
    } catch (e2) {
      setErr(e2.response?.data?.error || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-1">Upload a study resource</h3>
      <p className="text-sm text-gray-400 mb-4">
        Past papers, notes, and memos are welcome. Files go through admin review before
        they appear in the library.
      </p>

      {err && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-3">{err}</div>}
      {msg && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-xl mb-3">{msg}</div>}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Type *</label>
            <select
              value={form.docType}
              onChange={(e) => update('docType', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
            >
              <option value="past_paper">Past paper</option>
              <option value="notes">Notes</option>
              <option value="memo">Memo</option>
              <option value="tutorial">Tutorial</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
              placeholder="e.g. FRK300 Exam 2024 S2"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Module code</label>
            <input
              type="text"
              value={form.moduleCode}
              onChange={(e) => update('moduleCode', e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
              placeholder="FRK300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <select
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
            >
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'Select…'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Institution</label>
            <input
              type="text"
              value={form.institution}
              onChange={(e) => update('institution', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
              placeholder="e.g. UP"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Year</label>
            <input
              type="number"
              min="2000"
              max="2099"
              value={form.year}
              onChange={(e) => update('year', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Semester</label>
            <input
              type="text"
              value={form.semester}
              onChange={(e) => update('semester', e.target.value)}
              className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
              placeholder="S1, S2, Mid-year"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">File *</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.pptx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded-lg file:bg-[#00CC99]/20 file:text-[#00CC99] file:border-0 file:cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description (optional)</label>
          <textarea
            rows="2"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white"
            placeholder="Anything that helps other students find or use this resource"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
        >
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

function LockedView({ status, onUploaded }) {
  return (
    <div>
      <div className="glass-card rounded-2xl p-8 mb-6 text-center">
        <div className="text-5xl mb-3">🔒</div>
        <h2 className="text-2xl font-bold mb-2">Library locked</h2>
        <p className="text-gray-400 mb-4 max-w-xl mx-auto">
          {status?.totalUploads === 0
            ? 'Help your peers and unlock everyone else\'s study materials. Upload at least one past paper, set of notes, or memo to access the library.'
            : 'Your uploads are awaiting admin approval. The library unlocks as soon as one of them is approved.'}
        </p>
        <p className="text-xs text-gray-500">
          Required: {status?.requiredApprovedUploads ?? 1} approved upload — you have{' '}
          <span className="text-[#00CC99] font-semibold">{status?.approvedUploads ?? 0}</span> approved
          {' '}({status?.totalUploads ?? 0} total submitted)
        </p>
      </div>
      <UploadCard onUploaded={onUploaded} />
    </div>
  );
}

function MyUploadsList({ items, onChange }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h3 className="text-lg font-bold mb-3">Your uploads</h3>
      <div className="space-y-2">
        {items.map((d) => (
          <div key={d.id} className="flex items-center justify-between bg-[#0f172a]/40 rounded-lg p-3">
            <div className="min-w-0 pr-3">
              <p className="font-semibold truncate">{TYPE_ICON[d.doc_type]} {d.title}</p>
              <p className="text-xs text-gray-400 truncate">
                {d.module_code || '—'} · {TYPE_LABEL[d.doc_type]}
                {d.rejection_reason ? ` · Reason: ${d.rejection_reason}` : ''}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
              d.status === 'approved' ? 'bg-green-500/20 text-green-400'
              : d.status === 'rejected' ? 'bg-red-500/20 text-red-400'
              : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {d.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Documents() {
  const currentUser = authService.getCurrentUser();
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [myUploads, setMyUploads] = useState([]);
  const [docs, setDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    docType: '',
    subject: '',
    moduleCode: '',
    sort: 'newest'
  });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [moduleCodes, setModuleCodes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  const [previewDoc, setPreviewDoc] = useState(null);

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const s = await documentService.getMyStatus();
      setStatus(s);
      const my = await documentService.listMyUploads();
      setMyUploads(my.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { refreshStatus(); }, [refreshStatus]);

  // Reset to page 1 on any filter change.
  useEffect(() => {
    setPage(1);
  }, [filters.docType, filters.subject, filters.moduleCode, filters.sort, debouncedSearch]);

  // Load docs once unlocked.
  useEffect(() => {
    if (!status?.unlocked) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await documentService.list({
          ...filters,
          q: debouncedSearch.trim() || undefined,
          page,
          limit: 24
        });
        if (cancelled) return;
        setDocs(res.documents || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      } catch (e) {
        if (!cancelled) setError('Failed to load documents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status?.unlocked, filters, debouncedSearch, page]);

  // Load module-code autocomplete (only after unlocked).
  useEffect(() => {
    if (!status?.unlocked) return;
    documentService.getModuleCodes()
      .then((r) => setModuleCodes(r.moduleCodes || []))
      .catch(() => setModuleCodes([]));
  }, [status?.unlocked]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const codeSuggestions = useMemo(() => {
    const t = searchInput.trim().toUpperCase();
    if (!t) return [];
    return moduleCodes.filter((c) => c.includes(t)).slice(0, 8);
  }, [searchInput, moduleCodes]);

  if (!currentUser) {
    return (
      <div className="px-6 pt-24 pb-12 text-center">
        <p className="text-gray-400">Please sign in to access the document library.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pt-24 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
          Document Library
        </h1>
        <p className="text-gray-400">
          Past papers, notes, memos. Share to unlock — quality is reviewed by the team.
        </p>
      </div>

      {loadingStatus ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : !status?.unlocked ? (
        <>
          <LockedView status={status} onUploaded={refreshStatus} />
          <MyUploadsList items={myUploads} onChange={refreshStatus} />
        </>
      ) : (
        <>
          <UploadCard onUploaded={refreshStatus} />
          <MyUploadsList items={myUploads} onChange={refreshStatus} />

          {/* Filters */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="relative mb-4" ref={searchBoxRef}>
              <label className="block text-sm font-semibold mb-2">Search title, module code, subject</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl text-white placeholder-gray-500"
                placeholder="e.g. FRK300, Exam 2024"
              />
              {showSuggestions && codeSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#334155]">Module codes</div>
                  {codeSuggestions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setSearchInput(c); setShowSuggestions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-[#00CC99]/10 text-white"
                    >
                      <span className="font-semibold text-[#00CC99]">{c}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <select
                value={filters.docType}
                onChange={(e) => setFilters({ ...filters, docType: e.target.value })}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white"
              >
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white"
              >
                {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All subjects'}</option>)}
              </select>
              <input
                type="text"
                value={filters.moduleCode}
                onChange={(e) => setFilters({ ...filters, moduleCode: e.target.value.toUpperCase() })}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white"
                placeholder="Module code (e.g. FRK300)"
              />
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-3 py-2 bg-[#1e293b] border border-[#334155] rounded-lg text-white"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most viewed</option>
                <option value="year_desc">Year (newest first)</option>
              </select>
            </div>
          </div>

          <div className="mb-3 text-sm text-gray-400">
            {loading ? 'Loading…' : `${total} document${total === 1 ? '' : 's'}`}
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{error}</div>}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-40 animate-pulse" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 text-center text-gray-400">
              No documents match those filters yet. Try a different module code, or upload one to get started.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPreviewDoc(d)}
                  className="glass-card rounded-2xl p-5 text-left hover:scale-[1.02] hover:border-[#00CC99]/40 transition"
                >
                  <div className="text-3xl mb-2">{TYPE_ICON[d.doc_type] || '📄'}</div>
                  <h3 className="font-bold text-white line-clamp-2 mb-2">{d.title}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs px-2 py-0.5 bg-[#00CC99]/10 text-[#00CC99] rounded">{TYPE_LABEL[d.doc_type]}</span>
                    {d.module_code && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-300 font-mono rounded">{d.module_code}</span>
                    )}
                    {d.year && (
                      <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-300 rounded">{d.year}</span>
                    )}
                  </div>
                  {d.description && <p className="text-sm text-gray-400 line-clamp-2">{d.description}</p>}
                  <div className="text-xs text-gray-500 mt-3 flex justify-between">
                    <span>{d.subject || ''}</span>
                    <span>👁 {d.view_count || 0}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30">← Prev</button>
              <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30">Next →</button>
            </div>
          )}

          <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
        </>
      )}
    </div>
  );
}

export default Documents;
