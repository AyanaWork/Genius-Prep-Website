const pool = require('../config/database');
const { logAdminAction } = require('../utils/auditLog');

// Strip phone_number from any tutor object before returning to non-admin
// callers. Admin endpoints below are gated by adminRoutes' isAdmin guard,
// so we keep the field on these admin queries.

// =====================================================================
// STATS
// =====================================================================
exports.getStats = async (req, res) => {
  try {
    const stats = {};
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    stats.totalUsers = parseInt(usersResult.rows[0].count);
    const tutorsResult = await pool.query(`SELECT COUNT(*) as count FROM tutor_profiles WHERE approval_status = 'approved'`);
    stats.totalTutors = parseInt(tutorsResult.rows[0].count);
    const studentsResult = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`);
    stats.totalStudents = parseInt(studentsResult.rows[0].count);
    const bookingsResult = await pool.query('SELECT COUNT(*) as count FROM bookings');
    stats.totalBookings = parseInt(bookingsResult.rows[0].count);
    const reviewsResult = await pool.query('SELECT COUNT(*) as count FROM reviews');
    stats.totalReviews = parseInt(reviewsResult.rows[0].count);
    const subsResult = await pool.query(`SELECT COUNT(*) as count FROM gpa_subscriptions WHERE is_active = true AND end_date > CURRENT_TIMESTAMP`);
    stats.activeSubscriptions = parseInt(subsResult.rows[0].count);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// =====================================================================
// USER MANAGEMENT
// =====================================================================

// List users — supports ?role=student|tutor|admin filter and joins
// profile tables so the User Management page is readable.
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const params = [];
    let where = '';
    if (role && ['student', 'tutor', 'admin'].includes(role)) {
      params.push(role);
      where = 'WHERE u.role = $1';
    }

    const result = await pool.query(`
      SELECT
        u.id, u.email, u.role, u.is_active, u.is_verified, u.created_at,
        COALESCE(sp.display_name, tp.display_name) AS display_name,
        COALESCE(sp.phone_number, tp.phone_number) AS phone_number,
        tp.approval_status AS tutor_approval_status
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      LEFT JOIN tutor_profiles   tp ON tp.user_id = u.id
      ${where}
      ORDER BY u.created_at DESC
    `, params);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Toggle a user's is_active flag. Suspended users can't log in
// (authController.login already checks is_active). For an immediate
// kick, also DELETE the user — JWTs stay valid up to 7 days otherwise.
exports.setUserActive = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive (boolean) is required' });
    }
    if (parseInt(userId, 10) === req.userId) {
      return res.status(400).json({ error: 'You cannot suspend your own account' });
    }
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role, is_active',
      [isActive, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    logAdminAction({
      adminUserId: req.userId,
      action: isActive ? 'reactivated_user' : 'suspended_user',
      targetType: 'user',
      targetId: parseInt(userId, 10),
      ipAddress: req.ip
    });

    res.json({ message: isActive ? 'User reactivated' : 'User suspended', user: result.rows[0] });
  } catch (error) {
    console.error('Set user active error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Permanently delete a user. CASCADE on profile/booking foreign keys
// will clean up associated rows.
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (parseInt(userId, 10) === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, email, role',
      [userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    logAdminAction({
      adminUserId: req.userId,
      action: 'deleted_user',
      targetType: 'user',
      targetId: parseInt(userId, 10),
      metadata: { email: result.rows[0].email, role: result.rows[0].role },
      ipAddress: req.ip
    });

    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// =====================================================================
// TUTOR APPROVAL
// =====================================================================
exports.getPendingTutors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tp.*, u.email,
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

exports.getTutorById = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const result = await pool.query(`
      SELECT
        tp.*, u.email, u.created_at as user_created_at,
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
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    res.json({ tutor: result.rows[0] });
  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor details' });
  }
};

exports.approveTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const result = await pool.query(`
      UPDATE tutor_profiles
      SET approval_status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [tutorId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    logAdminAction({ adminUserId: req.userId, action: 'approved_tutor', targetType: 'tutor', targetId: parseInt(tutorId, 10), ipAddress: req.ip });
    res.json({ message: 'Tutor approved successfully', tutor: result.rows[0] });
  } catch (error) {
    console.error('Approve tutor error:', error);
    res.status(500).json({ error: 'Failed to approve tutor' });
  }
};

exports.rejectTutor = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Rejection reason is required' });
    const result = await pool.query(`
      UPDATE tutor_profiles
      SET approval_status = 'rejected', rejected_at = CURRENT_TIMESTAMP,
          rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `, [tutorId, reason]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    logAdminAction({ adminUserId: req.userId, action: 'rejected_tutor', targetType: 'tutor', targetId: parseInt(tutorId, 10), metadata: { reason }, ipAddress: req.ip });
    res.json({ message: 'Tutor rejected', tutor: result.rows[0] });
  } catch (error) {
    console.error('Reject tutor error:', error);
    res.status(500).json({ error: 'Failed to reject tutor' });
  }
};

exports.getAllTutorsAdmin = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tp.*, u.email, u.created_at as user_created_at,
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

exports.toggleTutorElite = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const { isElite } = req.body;
    const result = await pool.query(`
      UPDATE tutor_profiles SET is_elite = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *
    `, [isElite, tutorId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tutor not found' });
    res.json({ message: `Tutor ${isElite ? 'marked as' : 'removed from'} elite status`, tutor: result.rows[0] });
  } catch (error) {
    console.error('Toggle elite error:', error);
    res.status(500).json({ error: 'Failed to update elite status' });
  }
};

// =====================================================================
// CONTACT LOOKUP
// =====================================================================
exports.getUserContact = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];
    const resolvedType = type || user.role;

    let phoneRow = null;
    if (resolvedType === 'tutor') {
      const r = await pool.query('SELECT display_name, phone_number FROM tutor_profiles WHERE user_id = $1', [userId]);
      phoneRow = r.rows[0] || null;
    } else if (resolvedType === 'student') {
      const r = await pool.query('SELECT display_name, phone_number FROM student_profiles WHERE user_id = $1', [userId]);
      phoneRow = r.rows[0] || null;
    }

    logAdminAction({ adminUserId: req.userId, action: 'viewed_contact', targetType: resolvedType, targetId: parseInt(userId, 10), ipAddress: req.ip });

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

exports.getAuditLog = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500);
    const result = await pool.query(`
      SELECT a.id, a.action, a.target_type, a.target_id, a.metadata, a.ip_address, a.created_at,
             u.email AS admin_email
      FROM admin_audit_log a
      LEFT JOIN users u ON a.admin_user_id = u.id
      ORDER BY a.created_at DESC LIMIT $1
    `, [safeLimit]);
    res.json({ entries: result.rows });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
};

// =====================================================================
// SUBSCRIPTIONS
// =====================================================================
exports.getAllSubscriptions = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM gpa_subscriptions ORDER BY created_at DESC`);
    res.json({ subscriptions: result.rows });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
};

exports.activateSubscription = async (req, res) => {
  try {
    const { userId, subscriptionType, paymentReference } = req.body;
    if (!userId || !subscriptionType || !['annual', 'semester'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    const startDate = new Date();
    const endDate = new Date();
    let amount;
    if (subscriptionType === 'annual') { endDate.setFullYear(endDate.getFullYear() + 1); amount = 700; }
    else { endDate.setMonth(endDate.getMonth() + 6); amount = 450; }

    const result = await pool.query(`
      INSERT INTO gpa_subscriptions (user_id, subscription_type, amount, start_date, end_date, payment_reference, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *
    `, [userId, subscriptionType, amount, startDate, endDate, paymentReference || 'ADMIN_ACTIVATION']);

    res.json({ message: 'Subscription activated successfully', subscription: result.rows[0] });
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
};

module.exports = exports;
