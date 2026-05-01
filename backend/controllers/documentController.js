const Document = require('../models/Document');
const supabase = require('../config/supabase');
const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { logAdminAction } = require('../utils/auditLog');

const BUCKET = 'documents';
const REQUIRED_APPROVED_UPLOADS = 1;

const VALID_TYPES = ['past_paper', 'notes', 'memo', 'tutorial', 'other'];
const VALID_STATUSES_FOR_LIST = ['pending', 'approved', 'rejected'];
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
]);
const MAX_BYTES = 20 * 1024 * 1024;

function isMissingTable(err) {
  return err && (err.code === '42P01' || /relation .* does not exist/i.test(err.message || ''));
}
function missingTableResponse(res) {
  return res.status(503).json({
    error: 'documents_table_missing',
    message: 'The documents library has not been set up yet. Run backend/migrations/documents_2026_04_28.sql in your Supabase SQL editor, then try again.'
  });
}

/**
 * Decide whether a given user can browse the shared document library.
 * Rules:
 *   - admin            → always unlocked
 *   - tutor (approved) → unlocked
 *   - student          → needs ≥ REQUIRED_APPROVED_UPLOADS approved uploads
 *   - everyone else    → locked
 *
 * Returns a richly-typed status object the UI can render directly.
 */
async function getAccessStatus(userId, userRole) {
  if (userRole === 'admin') {
    return { unlocked: true, reason: 'admin' };
  }

  if (userRole === 'tutor') {
    let approval = null;
    try {
      const r = await pool.query(
        'SELECT approval_status FROM tutor_profiles WHERE user_id = $1',
        [userId]
      );
      approval = r.rows[0]?.approval_status || null;
    } catch { /* ignore — tutor_profiles always present */ }

    if (approval === 'approved') {
      return { unlocked: true, reason: 'approved_tutor' };
    }
    return {
      unlocked: false,
      reason: approval === 'rejected' ? 'tutor_rejected' : 'tutor_pending_approval',
      tutorApprovalStatus: approval || 'no_profile'
    };
  }

  // Default: students.
  const approved = await Document.approvedUploadCountByUser(userId);
  const total    = await Document.totalUploadCountByUser(userId);
  const unlocked = approved >= REQUIRED_APPROVED_UPLOADS;
  return {
    unlocked,
    reason: unlocked ? 'approved_upload' : (total === 0 ? 'no_upload' : 'pending_upload'),
    approvedUploads: approved,
    totalUploads: total,
    requiredApprovedUploads: REQUIRED_APPROVED_UPLOADS
  };
}

// =====================================================================
// CREATE
// =====================================================================
exports.upload = async (req, res) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return res.status(400).json({ error: `Unsupported file type: ${file.mimetype}.` });
    }
    if (file.size > MAX_BYTES) return res.status(400).json({ error: 'File too large (20 MB max)' });

    const { docType, subject, moduleCode, institution, year, semester, title, description } = req.body;
    if (!docType || !VALID_TYPES.includes(docType)) return res.status(400).json({ error: 'Invalid document type' });
    if (!title || title.trim().length < 3) return res.status(400).json({ error: 'Title is required (min 3 chars)' });

    const fileExt = (file.originalname.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    const storagePath = `${docType}/${userId}/${fileName}`;

    console.log('📤 Uploading document to Supabase:', { bucket: BUCKET, path: storagePath, size: file.size });

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });

    if (upErr) {
      console.error('❌ Supabase upload error:', upErr);
      return res.status(500).json({
        error: 'Upload failed',
        details: upErr.message,
        hint: `Make sure a "${BUCKET}" bucket exists in Supabase Storage and SUPABASE_SERVICE_ROLE_KEY is set.`
      });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const fileUrl = publicData?.publicUrl || '';

    let created;
    try {
      created = await Document.create({
        uploaderUserId: userId,
        docType, subject, moduleCode, institution,
        year: year ? parseInt(year, 10) : null,
        semester,
        title: title.trim(),
        description,
        storagePath, fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size
      });
    } catch (dbErr) {
      console.error('❌ DB insert error:', dbErr);
      try { await supabase.storage.from(BUCKET).remove([storagePath]); } catch {}
      if (isMissingTable(dbErr)) return missingTableResponse(res);
      throw dbErr;
    }

    res.status(201).json({
      message: 'Uploaded. Pending admin review before it goes live.',
      document: created
    });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
};

// =====================================================================
// LIST — GATED. The shared library opens once you're unlocked.
//   - admin and approved tutor → always unlocked
//   - student → after 1 approved upload of their own
// Locked users get 403 + the reason so the UI can prompt them.
// =====================================================================
exports.list = async (req, res) => {
  try {
    const status = await getAccessStatus(req.userId, req.userRole);

    if (!status.unlocked) {
      const messages = {
        no_upload:                'Upload at least one past paper, set of notes, or memo to unlock the library.',
        pending_upload:           'Your uploads are awaiting admin approval. The library unlocks as soon as one is approved.',
        tutor_pending_approval:   'Your tutor profile is awaiting admin approval. Once approved you\'ll have access to the library.',
        tutor_rejected:           'Your tutor profile was not approved. Update your profile and resubmit to gain access.'
      };
      return res.status(403).json({
        error: 'locked',
        ...status,
        message: messages[status.reason] || 'You do not yet have access to the library.'
      });
    }

    const result = await Document.listApproved(req.query);
    res.json({ ...result, unlocked: true });
  } catch (error) {
    console.error('List documents error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to load documents' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';
    const { id } = req.params;

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const isOwner = doc.uploader_user_id === userId;

    // Owner & admin can always see (any status).
    if (!isOwner && !isAdmin) {
      // Library viewers — must be unlocked AND doc must be approved.
      if (doc.status !== 'approved') return res.status(404).json({ error: 'Not found' });
      const status = await getAccessStatus(userId, req.userRole);
      if (!status.unlocked) return res.status(403).json({ error: 'locked', ...status });
    }

    Document.incrementViewCount(id).catch(() => {});
    res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

exports.listMyUploads = async (req, res) => {
  try {
    const docs = await Document.listByUploader(req.userId);
    res.json({ documents: docs });
  } catch (error) {
    console.error('List my uploads error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch your uploads' });
  }
};

/**
 * Status used by the UI to decide locked vs library view.
 */
exports.getMyStatus = async (req, res) => {
  try {
    const status = await getAccessStatus(req.userId, req.userRole);
    res.json(status);
  } catch (error) {
    console.error('Get my status error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

exports.listModuleCodes = async (req, res) => {
  try {
    const codes = await Document.distinctModuleCodes();
    res.json({ moduleCodes: codes });
  } catch (error) {
    console.error('List module codes error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch module codes' });
  }
};

// =====================================================================
// DELETE — owner can delete their own upload.
// =====================================================================
exports.deleteMyUpload = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.uploader_user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own uploads' });
    }

    await Document.deleteById(id);
    try { await supabase.storage.from(BUCKET).remove([doc.storage_path]); } catch (err) {
      console.warn('Storage delete failed:', err.message);
    }
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Delete my upload error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to delete' });
  }
};

// =====================================================================
// ADMIN
// =====================================================================
exports.adminList = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    if (!VALID_STATUSES_FOR_LIST.includes(status)) return res.status(400).json({ error: 'Invalid status filter' });
    const docs = await Document.listForModeration(status);
    res.json({ documents: docs });
  } catch (error) {
    console.error('Admin list error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to load documents' });
  }
};

exports.adminApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Document.setStatus(id, 'approved', { moderatorUserId: req.userId });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    logAdminAction({ adminUserId: req.userId, action: 'approved_document', targetType: 'document', targetId: parseInt(id, 10), ipAddress: req.ip });
    res.json({ document: updated });
  } catch (error) {
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to approve' });
  }
};

exports.adminReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Rejection reason is required' });
    const updated = await Document.setStatus(id, 'rejected', { moderatorUserId: req.userId, rejectionReason: reason });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    logAdminAction({ adminUserId: req.userId, action: 'rejected_document', targetType: 'document', targetId: parseInt(id, 10), metadata: { reason }, ipAddress: req.ip });
    res.json({ document: updated });
  } catch (error) {
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to reject' });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Document.deleteById(id);
    if (!removed) return res.status(404).json({ error: 'Not found' });
    try { await supabase.storage.from(BUCKET).remove([removed.storage_path]); } catch (err) { console.warn(err.message); }
    logAdminAction({ adminUserId: req.userId, action: 'deleted_document', targetType: 'document', targetId: parseInt(id, 10), ipAddress: req.ip });
    res.json({ message: 'Deleted' });
  } catch (error) {
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
