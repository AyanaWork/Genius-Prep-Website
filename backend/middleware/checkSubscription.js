const pool = require('../config/database');

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Check for active, non-expired subscription
    const result = await pool.query(`
      SELECT * FROM gpa_subscriptions 
      WHERE user_id = $1 
      AND is_active = true
      ORDER BY end_date DESC
      LIMIT 1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({ 
        error: 'No active GPA subscription',
        requiresSubscription: true 
      });
    }

    const subscription = result.rows[0];
    const now = new Date();
    const endDate = new Date(subscription.end_date);

    // Check if subscription has expired
    if (now > endDate) {
      // Mark as inactive
      await pool.query(`
        UPDATE gpa_subscriptions 
        SET is_active = false 
        WHERE id = $1
      `, [subscription.id]);

      return res.status(403).json({ 
        error: 'Your GPA subscription has expired. Please renew to continue.',
        requiresSubscription: true,
        expiredDate: endDate
      });
    }

    // Subscription is valid
    req.subscription = subscription;
    next();

  } catch (error) {
    console.error('❌ Subscription check error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};

module.exports = checkSubscription;