const TutorRequest = require('../models/TutorRequest');
const { logAdminAction } = require('../utils/auditLog');

const VALID_REQUESTER_TYPES = ['student', 'bursary', 'parent'];
const VALID_FORMATS = ['online', 'in-person', 'hybrid'];
const VALID_STATUSES = ['new', 'reviewing', 'matched', 'contacted', 'closed'];
const PHONE_RE = /^[+0-9 ()\-]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * PUBLIC: Create a tutor request.
 * Wired to a strict rate limiter at the route level. No auth required.
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      requesterType,
      fullName,
      email,
      phoneNumber,
      organisation,
      educationLevel,
      institution,
      subjects,
      moduleCodes,
      budgetPerHour,
      preferredFormat,
      location,
      numberOfStudents,
      notes
    } = req.body;

    // ---- Validation ----
    if (!requesterType || !VALID_REQUESTER_TYPES.includes(requesterType)) {
      return res.status(400).json({ error: 'Invalid requester type' });
    }
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!phoneNumber || !PHONE_RE.test(phoneNumber)) {
      return res.status(400).json({ error: 'Valid phone number is required' });
    }
    if (preferredFormat && !VALID_FORMATS.includes(preferredFormat)) {
      return res.status(400).json({ error: 'Invalid preferred format' });
    }
    if (notes && notes.length > 2000) {
      return res.status(400).json({ error: 'Notes too long (max 2000 chars)' });
    }

    // Normalise module codes to uppercase, trim whitespace.
    const cleanedModuleCodes = Array.isArray(moduleCodes)
      ? moduleCodes
          .map((c) => (typeof c === 'string' ? c.trim().toUpperCase() : ''))
          .filter(Boolean)
      : [];

    const cleanedSubjects = Array.isArray(subjects)
      ? subjects.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
      : [];

    const created = await TutorRequest.create({
      requesterType,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.trim(),
      organisation,
      educationLevel,
      institution,
      subjects: cleanedSubjects,
      moduleCodes: cleanedModuleCodes,
      budgetPerHour: budgetPerHour ? parseFloat(budgetPerHour) : null,
      preferredFormat,
      location,
      numberOfStudents: parseInt(numberOfStudents, 10) || 1,
      notes
    });

    res.status(201).json({
      message: 'Request received. Our team will reach out shortly.',
      requestId: created.id
    });
  } catch (error) {
    console.error('Create tutor request error:', error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

/**
 * ADMIN: List tutor requests, optionally filtered by status.
 */
exports.adminListRequests = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    const requests = await TutorRequest.list({
      status,
      limit: Math.min(parseInt(limit, 10) || 50, 200),
      offset: parseInt(offset, 10) || 0
    });
    res.json({ requests });
  } catch (error) {
    console.error('List tutor requests error:', error);
    res.status(500).json({ error: 'Failed to list requests' });
  }
};

/**
 * ADMIN: Get a single tutor request (full details, including phone).
 * Audit-logged because it exposes contact info.
 */
exports.adminGetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TutorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    logAdminAction({
      adminUserId: req.userId,
      action: 'viewed_tutor_request',
      targetType: 'request',
      targetId: parseInt(id, 10),
      ipAddress: req.ip
    });

    res.json({ request });
  } catch (error) {
    console.error('Get tutor request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
};

/**
 * ADMIN: Update status, admin_notes, or matched_tutor_ids on a request.
 */
exports.adminUpdateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, matched_tutor_ids } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updated = await TutorRequest.update(id, {
      status,
      admin_notes,
      matched_tutor_ids: Array.isArray(matched_tutor_ids)
        ? matched_tutor_ids.map(Number).filter(Number.isFinite)
        : undefined
    });

    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    logAdminAction({
      adminUserId: req.userId,
      action: 'updated_tutor_request',
      targetType: 'request',
      targetId: parseInt(id, 10),
      metadata: { status, hasMatched: Array.isArray(matched_tutor_ids) },
      ipAddress: req.ip
    });

    res.json({ request: updated });
  } catch (error) {
    console.error('Update tutor request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

/**
 * ADMIN: Auto-matched shortlist for a request.
 * Queries tutors whose subjects or module codes overlap with the request,
 * within budget if one was given.
 */
exports.adminGetShortlist = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TutorRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const tutors = await TutorRequest.findMatchingTutors({
      subjects: request.subjects || [],
      moduleCodes: request.module_codes || [],
      budgetPerHour: request.budget_per_hour
        ? parseFloat(request.budget_per_hour)
        : null,
      limit: 10
    });

    res.json({ shortlist: tutors });
  } catch (error) {
    console.error('Get shortlist error:', error);
    res.status(500).json({ error: 'Failed to compute shortlist' });
  }
};
