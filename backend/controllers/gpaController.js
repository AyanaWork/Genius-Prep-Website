const openaiService = require('../services/openai');
const pool = require('../config/database');

// Check if user has active GPA subscription
async function checkSubscription(userId) {
  const query = `
    SELECT * FROM gpa_subscriptions 
    WHERE user_id = $1 
    AND is_active = true 
    AND end_date > CURRENT_TIMESTAMP
    ORDER BY end_date DESC
    LIMIT 1
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

// Generate study notes
exports.generateNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { topic, educationLevel } = req.body;

    // Validation
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true,
        message: 'Subscribe to GPA to access AI-powered study tools'
      });
    }

    // Generate notes using OpenAI
    const result = await openaiService.generateNotes(topic, educationLevel || 'university');

    res.json({
      success: true,
      notes: result.content,
      topic,
      educationLevel: educationLevel || 'university',
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Generate notes error:', error);
    res.status(500).json({ error: 'Failed to generate notes' });
  }
};

// Generate practice test
exports.generateTest = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, topics, numQuestions, difficulty } = req.body;

    // Validation
    if (!subject || !topics) {
      return res.status(400).json({ error: 'Subject and topics are required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true 
      });
    }

    // Generate test using OpenAI
    const result = await openaiService.generateTest(
      subject, 
      topics, 
      numQuestions || 10, 
      difficulty || 'medium'
    );

    res.json({
      success: true,
      test: result.content,
      subject,
      topics,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Generate test error:', error);
    res.status(500).json({ error: 'Failed to generate test' });
  }
};

// Answer a question
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const { question, context } = req.body;

    // Validation
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true 
      });
    }

    // Get answer from OpenAI
    const result = await openaiService.answerQuestion(question, context);

    res.json({
      success: true,
      answer: result.content,
      question,
      answeredAt: new Date()
    });

  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

// Analyze content
exports.analyzeContent = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, analysisType } = req.body;

    // Validation
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true 
      });
    }

    // Analyze using OpenAI
    const result = await openaiService.analyzeContent(content, analysisType || 'summary');

    res.json({
      success: true,
      analysis: result.content,
      analysisType: analysisType || 'summary',
      analyzedAt: new Date()
    });

  } catch (error) {
    console.error('Analyze content error:', error);
    res.status(500).json({ error: 'Failed to analyze content' });
  }
};

// Translate content
exports.translateContent = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, targetLanguage } = req.body;

    // Validation
    if (!content || !targetLanguage) {
      return res.status(400).json({ error: 'Content and target language are required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true 
      });
    }

    // Translate using OpenAI
    const result = await openaiService.translateContent(content, targetLanguage);

    res.json({
      success: true,
      translation: result.content,
      targetLanguage,
      translatedAt: new Date()
    });

  } catch (error) {
    console.error('Translate content error:', error);
    res.status(500).json({ error: 'Failed to translate content' });
  }
};

// Generate memo
exports.generateMemo = async (req, res) => {
  try {
    const userId = req.userId;
    const { questions } = req.body;

    // Validation
    if (!questions) {
      return res.status(400).json({ error: 'Questions are required' });
    }

    // Check subscription
    const subscription = await checkSubscription(userId);
    if (!subscription) {
      return res.status(403).json({ 
        error: 'GPA subscription required',
        requiresSubscription: true 
      });
    }

    // Generate memo using OpenAI
    const result = await openaiService.generateMemo(questions);

    res.json({
      success: true,
      memo: result.content,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Generate memo error:', error);
    res.status(500).json({ error: 'Failed to generate memo' });
  }
};

// Check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await checkSubscription(userId);

    if (subscription) {
      res.json({
        hasSubscription: true,
        subscription: {
          type: subscription.subscription_type,
          endDate: subscription.end_date,
          daysRemaining: Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        }
      });
    } else {
      res.json({
        hasSubscription: false,
        message: 'No active GPA subscription',
        prices: {
          annual: 700,
          semester: 450
        }
      });
    }

  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
};

// Create subscription (for now, manual/admin only)
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionType, paymentReference } = req.body;

    // Validation
    if (!subscriptionType || !['annual', 'semester'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
    }

    // Calculate dates and amount
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

    // Create subscription
    const query = `
      INSERT INTO gpa_subscriptions 
      (user_id, subscription_type, amount, start_date, end_date, payment_reference, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      subscriptionType,
      amount,
      startDate,
      endDate,
      paymentReference || 'MANUAL_ACTIVATION'
    ]);

    res.json({
      success: true,
      message: 'GPA subscription activated!',
      subscription: result.rows[0]
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

module.exports = exports;