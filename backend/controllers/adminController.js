const pool = require('../config/database');

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const stats = {};

    // Total users
    const usersResult = await pool.query('SELECT COUNT(*) as count, role FROM users GROUP BY role');
    stats.totalUsers = usersResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    stats.totalTutors = usersResult.rows.find(r => r.role === 'tutor')?.count || 0;
    stats.totalStudents = usersResult.rows.find(r => r.role === 'student')?.count || 0;

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

// Get all tutors with profiles
exports.getAllTutors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.created_at,
        tp.id as profile_id, tp.display_name, tp.profile_picture_url, 
        tp.subjects, tp.hourly_rate, tp.is_elite, tp.availability_status,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE u.role = 'tutor' AND tp.id IS NOT NULL
      GROUP BY u.id, tp.id
      ORDER BY u.created_at DESC
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