const pool = require('../config/database');
const { logAdminAction } = require('../utils/auditLog');

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const stats = {};

    // Total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    stats.totalUsers = parseInt(usersResult.rows[0].count);

    // Total tutors
    const tutorsResult = await pool.query(`
      SELECT COUNT(*) as count FROM tutor_profiles WHERE approval_status = 'approved'
    `);
    stats.totalTutors = parseInt(tutorsResult.rows[0].count);

    // Total students
    const studentsResult = await pool.query(`
      SELECT COUNT(*) as count FROM users WHERE role = 'student'
    `);
    stats.totalStudents = parseInt(studentsResult.rows[0].count);

    // Total bookings
    const bookingsResult = await pool.query('SELECT COUNT(*) as count FROM bookings');
    stats.totalBookings = parseInt(bookingsResult.rows[0].count);

    // Total reviews
    const reviewsResult = await pool.query('SELECT COUNT(*) as count FROM reviews');
    stats.totalReviews = parseInt(reviewsResult.rows[0].count);

    // Active subscriptions
    const subsResult = await pool.query(`
      SELECT COUNT(*) as count FROM gpa_subscriptions 
      WHERE is_active = true AND end_date > CURRENT_TIMESTAMP
    `);
    stats.activeSubscriptions = parseInt(subsResult.rows[0].count);

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, role, is_active, is_verified, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get all pending tutors for approval.
// Phone numbers are returned here because this endpoint is gated by
// adminAuth — see adminRoutes.js where router.use(isAdmin) is applied.
exports.getPendingTutors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tp.*,
        u.email,
        (SELECT document_url FROM tutor_documents
         WHERE tutor_id = tp.id AND document_type = 'id_document'
         ORDER BY uploaded_at DESC LIMIT 1) as id_document_url,
        (SELECT document_url FROM tutor_documents
         WHERE tutor_id = tp.id AND document_type = 'academic_transcript'
         ORDER BY uploaded_at DESC LIMIT 1) as transcript_url
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.approval_status = 'pending'
      ORDER BY tp.created_at DESC
    `);

    res.json({ tutors: result.rows });
  } catch (error) {
    console.error('Get pending tutors error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tutors' });
  }
};

// Get single tutor by ID (for viewing details)
exports.getTutorById = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const result = await pool.query(`
      SELECT 
        tp.*,
        u.email,
        u.created_at as user_created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'id_document' 
         ORDER BY uploaded_at DESC LIMIT 1) as id_document_url,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'academic_transcript' 
         ORDER BY uploaded_at DESC LIMIT 1) as transcript_url
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.id = $1
      GROUP BY tp.id, u.email, u.created_at
    `, [tutorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ tutor: result.rows[0] });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor details' });
  }
};

// Approve a tutor
exports.approveTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const result = await pool.query(`
      UPDATE tutor_profiles
      SET
        approval_status = 'approved',
        approved_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [tutorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Audit: who approved which tutor.
    logAdminAction({
      adminUserId: req.userId,
      action: 'approved_tutor',
      targetType: 'tutor',
      targetId: parseInt(tutorId, 10),
      ipAddress: req.ip
    });

    res.json({
      message: 'Tutor approved successfully',
      tutor: result.rows[0]
    });
  } catch (error) {
    console.error('Approve tutor error:', error);
    res.status(500).json({ error: 'Failed to approve tutor' });
  }
};

// Reject a tutor
exports.rejectTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await pool.query(`
      UPDATE tutor_profiles 
      SET 
        approval_status = 'rejected',
        rejected_at = CURRENT_TIMESTAMP,
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [tutorId, reason]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    // Audit: who rejected, with reason.
    logAdminAction({
      adminUserId: req.userId,
      action: 'rejected_tutor',
      targetType: 'tutor',
      targetId: parseInt(tutorId, 10),
      metadata: { reason },
      ipAddress: req.ip
    });

    res.json({
      message: 'Tutor rejected',
      tutor: result.rows[0]
    });
  } catch (error) {
    console.error('Reject tutor error:', error);
    res.status(500).json({ error: 'Failed to reject tutor' });
  }
};

/**
 * Get contact details (email + phone) for a user — admin only.
 * Logged to admin_audit_log every time so we can answer "who saw whose
 * phone number, when?".
 *
 * Pass `?type=tutor` or `?type=student`. If omitted we infer from role.
 */
exports.getUserContact = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    // Look up the role first if type wasn't given.
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    const resolvedType = type || user.role;

    let phoneRow = null;
    if (resolvedType === 'tutor') {
      const r = await pool.query(
        'SELECT display_name, phone_number FROM tutor_profiles WHERE user_id = $1',
        [userId]
      );
      phoneRow = r.rows[0] || null;
    } else if (resolvedType === 'student') {
      const r = await pool.query(
        'SELECT display_name, phone_number FROM student_profiles WHERE user_id = $1',
        [userId]
      );
      phoneRow = r.rows[0] || null;
    }

    // Audit: who looked up which user's contact details.
    logAdminAction({
      adminUserId: req.userId,
      action: 'viewed_contact',
      targetType: resolvedType,
      targetId: parseInt(userId, 10),
      ipAddress: req.ip
    });

    res.json({
      contact: {
        userId: user.id,
        role: user.role,
        displayName: phoneRow?.display_name || null,
        email: user.email,
        phoneNumber: phoneRow?.phone_number || null
      }
    });
  } catch (error) {
    console.error('Get user contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact details' });
  }
};

/**
 * Recent admin audit entries — supports a "who did what" page.
 */
exports.getAuditLog = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const result = await pool.query(`
      SELECT
        a.id, a.action, a.target_type, a.target_id, a.metadata,
        a.ip_address, a.created_at,
        u.email AS admin_email
      FROM admin_audit_log a
      LEFT JOIN users u ON a.admin_user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `, [safeLimit]);
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
};

// Get all tutors (including pending, approved, rejected)
exports.getAllTutorsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tp.*,
        u.email,
        u.created_at as user_created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'id_document' 
         ORDER BY uploaded_at DESC LIMIT 1) as id_document_url,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'academic_transcript' 
         ORDER BY uploaded_at DESC LIMIT 1) as transcript_url
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      GROUP BY tp.id, u.email, u.created_at
      ORDER BY tp.created_at DESC
    `);
    
    res.json({ tutors: result.rows });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

// Toggle tutor elite status
exports.toggleTutorElite = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { isElite } = req.body;

    const result = await pool.query(`
      UPDATE tutor_profiles 
      SET is_elite = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [isElite, tutorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ 
      message: `Tutor ${isElite ? 'marked as' : 'removed from'} elite status`,
      tutor: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle elite error:', error);
    res.status(500).json({ error: 'Failed to update elite status' });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM gpa_subscriptions 
      ORDER BY created_at DESC
    `);
    
    res.json({ subscriptions: result.rows });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

// Activate subscription for a user (admin only)
exports.activateSubscription = async (req, res) => {
  try {
    const { userId, subscriptionType, paymentReference } = req.body;

    // Validation
    if (!userId || !subscriptionType || !['annual', 'semester'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const startDate = new Date();
    const endDate = new Date();
    let amount;

    if (subscriptionType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = 700;
    } else {
      endDate.setMonth(endDate.getMonth() + 6);
      amount = 450;
    }

    const result = await pool.query(`
      INSERT INTO gpa_subscriptions 
      (user_id, subscription_type, amount, start_date, end_date, payment_reference, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `, [userId, subscriptionType, amount, startDate, endDate, paymentReference || 'ADMIN_ACTIVATION']);

    res.json({
      message: 'Subscription activated successfully',
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
};

module.exports = exports;