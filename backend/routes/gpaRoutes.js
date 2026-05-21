const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const gpaController = require('../controllers/gpaController');
const checkSubscription = require('../middleware/checkSubscription');
const auth = require('../middleware/auth');

// All GPA routes require authentication
router.use(auth);

// Check subscription status
router.get('/subscription/status', gpaController.checkSubscriptionStatus);

// Create/activate subscription
router.post('/subscription/create', gpaController.createSubscription);

// Lwazi AI features — ALL require an active GPA subscription.
// (auth is already applied via router.use(auth) above; checkSubscription
// enforces that req.userId has a non-expired gpa_subscriptions row.)
router.post('/generate-notes', checkSubscription, gpaController.generateNotes);
router.post('/generate-test', checkSubscription, gpaController.generateTest);
router.post('/answer-question', checkSubscription, gpaController.answerQuestion);
router.post('/chat', checkSubscription, gpaController.chat);
router.post('/analyze-content', checkSubscription, gpaController.analyzeContent);
router.post('/analyze-pdf', checkSubscription, gpaController.analyzePDF);

// Get all conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(`
      SELECT id, conversation_id, title, created_at, updated_at
      FROM gpa_chats
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      conversations: result.rows
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to load conversations' });
  }
});

// Get specific conversation messages
router.get('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    
    const result = await pool.query(`
      SELECT messages, title
      FROM gpa_chats
      WHERE user_id = $1 AND conversation_id = $2
    `, [userId, conversationId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json({
      success: true,
      messages: result.rows[0].messages,
      title: result.rows[0].title
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to load conversation' });
  }
});

// Save/Update conversation
router.post('/conversations', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, title, messages } = req.body;
    
    const result = await pool.query(`
      INSERT INTO gpa_chats (user_id, conversation_id, title, messages)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, conversation_id)
      DO UPDATE SET
        title = $3,
        messages = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, conversationId, title || 'New Chat', JSON.stringify(messages)]);
    
    res.json({
      success: true,
      conversation: result.rows[0]
    });
  } catch (error) {
    console.error('Save conversation error:', error);
    res.status(500).json({ error: 'Failed to save conversation' });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;
    
    await pool.query(`
      DELETE FROM gpa_chats
      WHERE user_id = $1 AND conversation_id = $2
    `, [userId, conversationId]);
    
    res.json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

module.exports = router;