const Document = require('../models/Document');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { logAdminAction } = require('../utils/auditLog');

// Bucket name (the user has created this in Supabase Storage).
const BUCKET = 'documents';

// "Give to get" gate: how many APPROVED uploads required to unlock the library.
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
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

async function userIsUnlocked(userId) {
  const n = await Document.approvedUploadCountByUser(userId);
  return n >= REQUIRED_APPROVED_UPLOADS;
}

// ---------------------------------------------------------------------
// CREATE — mirrors the working profile-picture upload flow.
// Uses getPublicUrl (same as uploadController.js) so previews work
// without re-signing every time. Make the bucket PUBLIC in Supabase
// (Storage → bucket → settings → make public). Files stay obscure
// because the URL embeds a UUID-based path.
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
        error: `Unsupported file type: ${file.mimetype}. Allowed: PDF, images, Word, PowerPoint, plain text.`
      });
    }
    if (file.size > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large (20 MB max)' });
    }

    const {
      docType, subject, moduleCode, institution,
      year, semester, title, description
    } = req.body;

    if (!docType || !VALID_TYPES.includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ error: 'Title is required (min 3 chars)' });
    }

    const fileExt = (file.originalname.split('.').pop() || 'bin').toLowerCase();
    const fileName = `${uuidv4()}.${fileExt}`;
    const storagePath = `${docType}/${userId}/${fileName}`;

    console.log('📤 Uploading document to Supabase:', { bucket: BUCKET, path: storagePath, size: file.size, mime: file.mimetype });

    const { data: upData, error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (upErr) {
      console.error('❌ Supabase upload error:', upErr);
      return res.status(500).json({
        error: 'Upload failed',
        details: upErr.message,
        hint: `Make sure a "${BUCKET}" bucket exists in Supabase Storage and SUPABASE_SERVICE_ROLE_KEY is set in backend/.env.`
      });
    }

    // Public URL — works as long as the bucket is set to "public" in Supabase.
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);
    const fileUrl = publicData?.publicUrl || '';

    console.log('✅ Document uploaded:', fileUrl);

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
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size
    });

    res.status(201).json({
      message: 'Uploaded. Pending admin review before it goes live.',
      document: created
    });
  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      error: 'Failed to upload document',
      details: error.message
    });
  }
};

// ---------------------------------------------------------------------
// LIST (gated)
// ---------------------------------------------------------------------
exports.list = async (req, res) => {
  try {
    const userId = req.userId;
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
        message: totalUploads === 0
          ? 'Upload at least one past paper, set of notes, or memo to unlock the library.'
          : 'Your uploads are awaiting admin approval. Once approved, the library unlocks.'
      });
    }

    const result = await Document.listApproved(req.query);
    res.json({ ...result, unlocked: true });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Failed to load documents' });
  }
};

// ---------------------------------------------------------------------
// READ ONE
// ---------------------------------------------------------------------
exports.getOne = async (req, res) => {
  try {
    const userId = req.userId;
    const isAdmin = req.userRole === 'admin';
    const { id } = req.params;

    const doc = await Document.findById(id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const isOwner = doc.uploader_user_id === userId;
    if (doc.status !== 'approved' && !isAdmin && !isOwner) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!isAdmin && !isOwner) {
      const unlocked = await userIsUnlocked(userId);
      if (!unlocked) return res.status(403).json({ error: 'locked' });
    }

    Document.incrementViewCount(id).catch(() => {});
    res.json({ document: doc });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
};

exports.listMyUploads = async (req, res) => {
  try {
    const docs = await Document.listByUploader(req.userId);
    res.json({ documents: docs });
  } catch (error) {
    console.error('List my uploads error:', error);
    res.status(500).json({ error: 'Failed to fetch your uploads' });
  }
};

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
    const updated = await Document.setStatus(id, 'approved', { moderatorUserId: req.userId });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    logAdminAction({ adminUserId: req.userId, action: 'approved_document', targetType: 'document', targetId: parseInt(id, 10), ipAddress: req.ip });
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
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Rejection reason is required' });
    const updated = await Document.setStatus(id, 'rejected', { moderatorUserId: req.userId, rejectionReason: reason });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    logAdminAction({ adminUserId: req.userId, action: 'rejected_document', targetType: 'document', targetId: parseInt(id, 10), metadata: { reason }, ipAddress: req.ip });
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
    try {
      await supabase.storage.from(BUCKET).remove([removed.storage_path]);
    } catch (err) {
      console.warn('Storage delete failed:', err.message);
    }
    logAdminAction({ adminUserId: req.userId, action: 'deleted_document', targetType: 'document', targetId: parseInt(id, 10), ipAddress: req.ip });
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Admin delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
};
