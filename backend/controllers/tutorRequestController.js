const TutorRequest = require('../models/TutorRequest');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAdminAction } = require('../utils/auditLog');

const VALID_REQUESTER_TYPES = ['student', 'bursary', 'parent'];
const VALID_FORMATS = ['online', 'in-person', 'hybrid'];
const VALID_STATUSES = ['new', 'reviewing', 'matched', 'contacted', 'closed'];
const PHONE_RE = /^[+0-9 ()\-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isMissingTable(err) {
  return err && (err.code === '42P01' || /relation .* does not exist/i.test(err.message || ''));
}
function missingTableResponse(res) {
  return res.status(503).json({
    error: 'tutor_requests_table_missing',
    message:
      'The tutor request system has not been set up yet. Run backend/migrations/enhancements_2026_04_28.sql in your Supabase SQL editor, then try again.'
  });
}

/**
 * Optionally decode the auth token if present, so we can attach
 * requester_user_id when a logged-in student submits the form.
 * The form itself is public — token is not required.
 */
function tryGetUserId(req) {
  try {
    const tok = req.header('Authorization')?.replace('Bearer ', '');
    if (!tok) return null;
    const decoded = jwt.verify(tok, process.env.JWT_SECRET);
    return decoded?.userId || null;
  } catch { return null; }
}

// =====================================================================
// PUBLIC: create a request
// =====================================================================
exports.createRequest = async (req, res) => {
  try {
    const {
      requesterType, fullName, email, phoneNumber,
      organisation, educationLevel, institution,
      subjects, moduleCodes, budgetPerHour,
      preferredFormat, location, numberOfStudents, notes
    } = req.body;

    if (!requesterType || !VALID_REQUESTER_TYPES.includes(requesterType)) return res.status(400).json({ error: 'Invalid requester type' });
    if (!fullName || fullName.trim().length < 2) return res.status(400).json({ error: 'Full name is required' });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (!phoneNumber || !PHONE_RE.test(phoneNumber)) return res.status(400).json({ error: 'Valid phone number is required' });
    if (preferredFormat && !VALID_FORMATS.includes(preferredFormat)) return res.status(400).json({ error: 'Invalid preferred format' });
    if (notes && notes.length > 2000) return res.status(400).json({ error: 'Notes too long (max 2000 chars)' });

    const cleanedModuleCodes = Array.isArray(moduleCodes)
      ? moduleCodes.map((c) => (typeof c === 'string' ? c.trim().toUpperCase() : '')).filter(Boolean)
      : [];
    const cleanedSubjects = Array.isArray(subjects)
      ? subjects.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
      : [];

    const created = await TutorRequest.create({
      requesterUserId: tryGetUserId(req),
      requesterType,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      organisation, educationLevel, institution,
      subjects: cleanedSubjects,
      moduleCodes: cleanedModuleCodes,
      budgetPerHour: budgetPerHour ? parseFloat(budgetPerHour) : null,
      preferredFormat, location,
      numberOfStudents: parseInt(numberOfStudents, 10) || 1,
      notes
    });

    res.status(201).json({
      message: 'Request received. Our team will reach out shortly.',
      requestId: created.id
    });
  } catch (error) {
    console.error('Create tutor request error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to submit request', details: error.message });
  }
};

// =====================================================================
// AUTH'D: list "my requests" (by user_id OR email match)
// =====================================================================
exports.listMyRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const requests = await TutorRequest.listByUser({
      userId: req.userId,
      email: user?.email || ''
    });

    // Hydrate matched tutors per request so the UI can render the
    // shortlist the admin picked, without an extra round-trip.
    const hydrated = await Promise.all(requests.map(async (r) => {
      const matchedTutors = await TutorRequest.getTutorsByIds(r.matched_tutor_ids || []);
      return { ...r, matched_tutors: matchedTutors };
    }));

    res.json({ requests: hydrated });
  } catch (error) {
    console.error('List my tutor requests error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
};

// =====================================================================
// AUTH'D: get one of my requests (must belong to me OR email match)
// =====================================================================
exports.getMyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TutorRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Not found' });

    const user = await User.findById(req.userId);
    const isOwner = request.requester_user_id === req.userId
      || (user?.email && request.email && user.email.toLowerCase() === request.email.toLowerCase());

    if (!isOwner) return res.status(404).json({ error: 'Not found' });

    const matchedTutors = await TutorRequest.getTutorsByIds(request.matched_tutor_ids || []);
    res.json({ request: { ...request, matched_tutors: matchedTutors } });
  } catch (error) {
    console.error('Get my request error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

// =====================================================================
// ADMIN
// =====================================================================
exports.adminListRequests = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status filter' });
    const requests = await TutorRequest.list({
      status,
      limit: Math.min(parseInt(limit, 10) || 50, 200),
      offset: parseInt(offset, 10) || 0
    });
    res.json({ requests });
  } catch (error) {
    console.error('List tutor requests error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to list requests' });
  }
};

exports.adminGetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TutorRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const matchedTutors = await TutorRequest.getTutorsByIds(request.matched_tutor_ids || []);

    logAdminAction({
      adminUserId: req.userId,
      action: 'viewed_tutor_request',
      targetType: 'request',
      targetId: parseInt(id, 10),
      ipAddress: req.ip
    });

    res.json({ request: { ...request, matched_tutors: matchedTutors } });
  } catch (error) {
    console.error('Get tutor request error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

exports.adminUpdateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, matched_tutor_ids } = req.body;
    if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const cleanedIds = Array.isArray(matched_tutor_ids)
      ? matched_tutor_ids.map(Number).filter(Number.isFinite)
      : undefined;

    // If admin saves at least one tutor and didn't pass an explicit
    // status, auto-flip status to 'matched' so the student sees their
    // shortlist as ready.
    const patch = { status, admin_notes, matched_tutor_ids: cleanedIds };
    if (!status && Array.isArray(cleanedIds) && cleanedIds.length > 0) {
      patch.status = 'matched';
    }

    const updated = await TutorRequest.update(id, patch);
    if (!updated) return res.status(404).json({ error: 'Request not found' });

    logAdminAction({
      adminUserId: req.userId,
      action: 'updated_tutor_request',
      targetType: 'request',
      targetId: parseInt(id, 10),
      metadata: { status: patch.status, hasMatched: Array.isArray(cleanedIds) },
      ipAddress: req.ip
    });

    const matchedTutors = await TutorRequest.getTutorsByIds(updated.matched_tutor_ids || []);
    res.json({ request: { ...updated, matched_tutors: matchedTutors } });
  } catch (error) {
    console.error('Update tutor request error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

exports.adminGetShortlist = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TutorRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const tutors = await TutorRequest.findMatchingTutors({
      subjects: request.subjects || [],
      moduleCodes: request.module_codes || [],
      budgetPerHour: request.budget_per_hour ? parseFloat(request.budget_per_hour) : null,
      limit: 20
    });
    res.json({ shortlist: tutors });
  } catch (error) {
    console.error('Get shortlist error:', error);
    if (isMissingTable(error)) return missingTableResponse(res);
    res.status(500).json({ error: 'Failed to compute shortlist' });
  }
};
