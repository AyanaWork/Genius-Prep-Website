const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pool = require('../config/database');

// Get chat messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const result = await pool.query(
      `SELECT 
        cm.*,
        u1.email as sender_email,
        u2.email as recipient_email
      FROM chat_messages cm
      JOIN users u1 ON cm.sender_id = u1.id
      JOIN users u2 ON cm.recipient_id = u2.id
      WHERE (cm.sender_id = $1 AND cm.recipient_id = $2)
         OR (cm.sender_id = $2 AND cm.recipient_id = $1)
      ORDER BY cm.created_at ASC`,
      [currentUserId, otherUserId]
    );

    // Mark messages as read
    await pool.query(
      `UPDATE chat_messages 
       SET is_read = TRUE 
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = FALSE`,
      [currentUserId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    if (!message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Verify recipient exists
    const recipientCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [recipientId]
    );

    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages (sender_id, recipient_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, recipientId, message.trim()]
    );

    res.json({ 
      message: 'Message sent successfully',
      chatMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM chat_messages
       WHERE recipient_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get list of conversations
router.get('/conversations/list', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `WITH latest_messages AS (
        SELECT 
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END as other_user_id,
          MAX(created_at) as last_message_time
        FROM chat_messages
        WHERE sender_id = $1 OR recipient_id = $1
        GROUP BY other_user_id
      )
      SELECT 
        lm.other_user_id,
        u.email,
        COALESCE(sp.display_name, tp.display_name) as display_name,
        COALESCE(sp.profile_picture_url, tp.profile_picture_url) as profile_picture_url,
        u.role,
        lm.last_message_time,
        COUNT(CASE WHEN cm.is_read = FALSE AND cm.recipient_id = $1 THEN 1 END) as unread_count
      FROM latest_messages lm
      JOIN users u ON lm.other_user_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN tutor_profiles tp ON u.id = tp.user_id
      LEFT JOIN chat_messages cm ON (
        (cm.sender_id = lm.other_user_id AND cm.recipient_id = $1) OR
        (cm.recipient_id = lm.other_user_id AND cm.sender_id = $1)
      )
      GROUP BY lm.other_user_id, u.email, sp.display_name, tp.display_name, 
               sp.profile_picture_url, tp.profile_picture_url, u.role, lm.last_message_time
      ORDER BY lm.last_message_time DESC`,
      [userId]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// Delete a conversation (all messages with a user)
router.delete('/conversation/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    await pool.query(
      `DELETE FROM chat_messages 
       WHERE (sender_id = $1 AND recipient_id = $2)
          OR (sender_id = $2 AND recipient_id = $1)`,
      [currentUserId, otherUserId]
    );

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;