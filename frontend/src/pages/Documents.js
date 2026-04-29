import React, { useState, useEffect, useRef, useCallback } from 'react';
import documentService from '../services/document';
import authService from '../services/auth';

const TYPE_LABEL = {
  past_paper: 'Past paper', notes: 'Notes', memo: 'Memo',
  tutorial: 'Tutorial', other: 'Other'
};
const TYPE_ICON = {
  past_paper: '📝', notes: '📒', memo: '🗒️', tutorial: '🎯', other: '📎'
};
const SUBJECT_OPTIONS = [
  '', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Accounting', 'Economics', 'Computer Science', 'Statistics', 'Law',
  'Psychology', 'Programming', 'Finance'
];

function isPdf(mime) { return mime === 'application/pdf'; }
function isImage(mime) { return typeof mime === 'string' && mime.startsWith('image/'); }

function PreviewModal({ doc, onClose }) {
  if (!doc) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0f172a] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold">{doc.title}</h3>
            <p className="text-xs text-gray-400">
              {TYPE_LABEL[doc.doc_type]}{doc.module_code ? ` · ${doc.module_code}` : ''}{doc.year ? ` · ${doc.year}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {doc.file_url && <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-[#00CC99]/20 text-[#00CC99] rounded-lg text-sm">Open in tab</a>}
            <button onClick={onClose} className="text-gray-400 hover:text-white px-2">✕</button>
          </div>
        </div>
        <div className="flex-1 bg-black/40 overflow-auto">
          {!doc.file_url ? (
            <div className="p-8 text-center text-gray-400">No preview available — the storage URL is empty. The Supabase bucket may be private; ask the admin to make it public.</div>
          ) : isPdf(doc.mime_type) ? (
            <iframe title={doc.title} src={doc.file_url} className="w-full h-[80vh]" />
          ) : isImage(doc.mime_type) ? (
            <img src={doc.file_url} alt={doc.title} className="max-w-full max-h-[80vh] mx-auto" />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p className="mb-3">Inline preview isn't supported for this file type.</p>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold inline-block">Download to view</a>
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
      setMsg('Uploaded! Awaiting admin review. Once approved you can preview it from "Your uploads" below.');
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
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold mb-1">Upload a study resource</h3>
      <p className="text-sm text-gray-400 mb-4">Files go through admin review before they're available on your account.</p>
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
          <textarea rows="2" value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-3 py-2 bg-[#0f172a]/40 border border-white/10 rounded-lg text-white" placeholder="Anything that helps you find or use this resource later" />
        </div>
        <button type="submit" disabled={submitting} className="w-full md:w-auto px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">{submitting ? 'Uploading…' : 'Upload'}</button>
      </form>
    </div>
  );
}

function MyUploadsList({ items, onPreview, onDelete }) {
  if (!items || items.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-gray-400">
        You haven't uploaded any documents yet. Use the form above to add your first one.
      </div>
    );
  }
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-bold mb-3">Your uploads ({items.length})</h3>
      <p className="text-xs text-gray-500 mb-3">Click an approved upload to preview. Use 🗑 to delete.</p>
      <div className="space-y-2">
        {items.map((d) => {
          const clickable = d.status === 'approved';
          return (
            <div key={d.id} className="flex items-center justify-between bg-[#0f172a]/40 rounded-lg p-3 gap-3">
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
              <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                d.status === 'approved' ? 'bg-green-500/20 text-green-400'
                : d.status === 'rejected' ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
              }`}>{d.status}</span>
              <button
                type="button"
                onClick={() => onDelete(d)}
                className="px-2 py-1 text-red-400 hover:bg-red-500/10 rounded-lg"
                title="Delete"
              >🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Documents() {
  const currentUser = authService.getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [setupError, setSetupError] = useState('');
  const [myUploads, setMyUploads] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setSetupError('');
    try {
      const my = await documentService.listMyUploads();
      setMyUploads(my.documents || []);
    } catch (e) {
      console.error(e);
      const data = e?.response?.data;
      if (e?.response?.status === 503 && data?.error === 'documents_table_missing') {
        setSetupError(data.message || 'Documents library is not set up yet.');
      } else {
        setSetupError('Could not load your documents. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handlePreview = async (doc) => {
    try {
      const res = await documentService.getOne(doc.id);
      setPreviewDoc(res.document || doc);
    } catch {
      setPreviewDoc(doc);
    }
  };

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    try {
      await documentService.deleteMyUpload(doc.id);
      refresh();
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to delete');
    }
  };

  if (!currentUser) {
    return (<div className="px-6 pt-24 pb-12 text-center"><p className="text-gray-400">Please sign in to access your documents.</p></div>);
  }

  return (
    <div className="container mx-auto px-6 pt-24 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">My Documents</h1>
        <p className="text-gray-400">
          Upload your past papers, notes, and memos. Only you can see your own uploads.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : setupError ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🔧</div>
          <h2 className="text-xl font-bold mb-2">Documents library not ready</h2>
          <p className="text-gray-400 max-w-xl mx-auto">{setupError}</p>
        </div>
      ) : (
        <>
          <UploadCard onUploaded={refresh} />
          <MyUploadsList items={myUploads} onPreview={handlePreview} onDelete={handleDelete} />
        </>
      )}

      <PreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

export default Documents;
