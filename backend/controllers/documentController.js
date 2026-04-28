const Document = require('../models/Document');
const supabase = require('../config/supabase');
const { logAdminAction } = require('../utils/auditLog');

const BUCKET = 'documents';

// Configure the give-to-get gate. Default: 1 approved upload required.
const REQUIRED_APPROVED_UPLOADS = 1;

const VALID_TYPES = ['past_paper', 'notes', 'memo', 'tutorial', 'other'];
const VALID_STATUSES_FOR_LIST = ['pending', 'approved', 'rejected'];
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword',                                                       // .doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain'
]);
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

function safeFilename(name) {
  return (name || 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .slice(-80);
}

/**
 * Has this user uploaded enough to be unlocked?
 */
async function userIsUnlocked(userId) {
  const n = await Document.approvedUploadCountByUser(userId);
  return n >= REQUIRED_APPROVED_UPLOADS;
}

/**
 * Generate a signed URL with reasonable expiry. Falls back to whatever
 * was stored in file_url if signing fails (e.g. when Supabase is in
 * stub mode in dev).
 */
async function freshSignedUrl(storagePath, fallback, expiresIn = 60 * 60) {
  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn);
    if (error || !data?.signedUrl) return fallback;
    return data.signedUrl;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------
exports.upload = async (req, res) => {
  try {
    const userId = req.userId;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!ALLOWED_MIME.has(file.mimetype)) {
      return res.status(400).json({
        error: 'Unsupported file type. Allowed: PDF, images, Word, PowerPoint, plain text.'
      });
    }
    if (file.size > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large (20 MB max)' });
    }

    const {
      docType,
      subject,
      moduleCode,
      institution,
      year,
      semester,
      title,
      description
    } = req.body;

    if (!docType || !VALID_TYPES.includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title is required (min 3 chars)' });
    }

    // Path layout makes browsing/cleanup easy in the Supabase dashboard.
    const ts = Date.now();
    const storagePath = `${docType}/${userId}/${ts}-${safeFilename(file.originalname)}`;

    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (upErr) {
      console.error('Supabase upload error:', upErr);
      return res.status(500).json({
        error: 'Upload failed. Make sure the "documents" bucket exists in Supabase.'
      });
    }

    // Best-effort signed URL — saved on the row for convenience and
    // re-signed on every read for fresh links.
    const signed = await freshSignedUrl(storagePath, '', 60 * 60);

    const created = await Document.create({
      uploaderUserId: userId,
      docType,
      subject,
      moduleCode,
      institution,
      year: year ? parseInt(year, 10) : null,
      semester,
      title: title.trim(),
      description,
      storagePath,
      fileUrl: signed || '',
      mimeType: file.mimetype,
      fileSize: file.size
    });

    res.status(201).json({
      message: 'Uploaded. Pending admin review before it goes live.',
      document: created
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

// ---------------------------------------------------------------------
// LIST (gated)
// ---------------------------------------------------------------------
exports.list = async (req, res) => {
  try {
    const userId = req.userId;

    // Admins can always see; everyone else must be unlocked.
    const isAdmin = req.userRole === 'admin';
    const unlocked = isAdmin || (await userIsUnlocked(userId));

    if (!unlocked) {
      const totalUploads = await Document.totalUploadCountByUser(userId);
      const approvedUploads = await Document.approvedUploadCountByUser(userId);
      return res.status(403).json({
        error: 'locked',
        unlocked: false,
        requiredApprovedUploads: REQUIRED_APPROVED_UPLOADS,
        approvedUploads,
        totalUploads,
        message:
          totalUploads === 0
            ? 'Upload at least one past paper, set of notes, or memo to unlock the library.'
            : 'Your uploads are awaiting admin approval. Once approved, the library unlocks.'
      });
    }

    const result = await Document.listApproved(req.query);

    // Re-sign URLs so links don't go stale.
    const documents = await Promise.all(
      result.documents.map(async (d) => ({
        ...d,
        file_url: await freshSignedUrl(undefined, d.file_url, 60 * 60) // keep stored URL if no path
      }))
    );

    res.json({ ...result, documents, unlocked: true });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to load documents' });
  }
};

// ---------------------------------------------------------------------
// READ ONE — also bumps view count and refreshes the signed URL
// ---------------------------------------------------------------------
exports.getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';
    const { id } = req.params;

    const doc = await Document.findById(id);
    if (!doc || (doc.status !== 'approved' && !isAdmin && doc.uploader_user_id !== userId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Gate: same as list, except a user can always preview their own
    // documents to see what was approved/rejected.
    if (!isAdmin && doc.uploader_user_id !== userId) {
      const unlocked = await userIsUnlocked(userId);
      if (!unlocked) {
        return res.status(403).json({ error: 'locked' });
      }
    }

    Document.incrementViewCount(id).catch(() => {}); // fire-and-forget
    const fresh = await freshSignedUrl(doc.storage_path, doc.file_url, 60 * 60);

    res.json({ document: { ...doc, file_url: fresh } });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

// ---------------------------------------------------------------------
// MY UPLOADS (always visible to the uploader)
// ---------------------------------------------------------------------
exports.listMyUploads = async (req, res) => {
  try {
    const docs = await Document.listByUploader(req.userId);
    res.json({ documents: docs });
  } catch (error) {
    console.error('List my uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch your uploads' });
  }
};

// ---------------------------------------------------------------------
// STATUS — quick check for the UI to render the locked/unlocked screen
// ---------------------------------------------------------------------
exports.getMyStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';
    const approved = await Document.approvedUploadCountByUser(userId);
    const total = await Document.totalUploadCountByUser(userId);
    res.json({
      unlocked: isAdmin || approved >= REQUIRED_APPROVED_UPLOADS,
      approvedUploads: approved,
      totalUploads: total,
      requiredApprovedUploads: REQUIRED_APPROVED_UPLOADS
    });
  } catch (error) {
    console.error('Get my status error:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

// ---------------------------------------------------------------------
// MODULE CODE LIST — autocomplete for the search box
// ---------------------------------------------------------------------
exports.listModuleCodes = async (req, res) => {
  try {
    const codes = await Document.distinctModuleCodes();
    res.json({ moduleCodes: codes });
  } catch (error) {
    console.error('List module codes error:', error);
    res.status(500).json({ error: 'Failed to fetch module codes' });
  }
};

// =====================================================================
// ADMIN moderation
// =====================================================================
exports.adminList = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    if (!VALID_STATUSES_FOR_LIST.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    const docs = await Document.listForModeration(status);
    res.json({ documents: docs });
  } catch (error) {
    console.error('Admin list error:', error);
    res.status(500).json({ error: 'Failed to load documents' });
  }
};

exports.adminApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Document.setStatus(id, 'approved', {
      moderatorUserId: req.userId
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });

    logAdminAction({
      adminUserId: req.userId,
      action: 'approved_document',
      targetType: 'document',
      targetId: parseInt(id, 10),
      ipAddress: req.ip
    });

    res.json({ document: updated });
  } catch (error) {
    console.error('Admin approve error:', error);
    res.status(500).json({ error: 'Failed to approve' });
  }
};

exports.adminReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    const updated = await Document.setStatus(id, 'rejected', {
      moderatorUserId: req.userId,
      rejectionReason: reason
    });
    if (!updated) return res.status(404).json({ error: 'Not found' });

    logAdminAction({
      adminUserId: req.userId,
      action: 'rejected_document',
      targetType: 'document',
      targetId: parseInt(id, 10),
      metadata: { reason },
      ipAddress: req.ip
    });

    res.json({ document: updated });
  } catch (error) {
    console.error('Admin reject error:', error);
    res.status(500).json({ error: 'Failed to reject' });
  }
};

exports.adminDelete = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await Document.deleteById(id);
    if (!removed) return res.status(404).json({ error: 'Not found' });

    // Best-effort delete from Supabase storage too.
    try {
      await supabase.storage.from(BUCKET).remove([removed.storage_path]);
    } catch (err) {
      console.warn('Storage delete failed:', err.message);
    }

    logAdminAction({
      adminUserId: req.userId,
      action: 'deleted_document',
      targetType: 'document',
      targetId: parseInt(id, 10),
      ipAddress: req.ip
    });

    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
