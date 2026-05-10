// Lwazi AI is powered by DeepSeek R1. The variable name is kept generic
// so the rest of the controller doesn't have to change.
const aiService = require('../services/deepseek');
const pool = require('../config/database');

const FREE_USAGE_LIMIT = 0;

// Check if user has active GPA subscription OR free tier access
async function checkGPAAccess(userId) {
  // Check for subscription
  const subQuery = `
    SELECT * FROM gpa_subscriptions
    WHERE user_id = $1
    AND is_active = true
    AND end_date > CURRENT_TIMESTAMP
    ORDER BY end_date DESC
    LIMIT 1
  `;
  
  const subResult = await pool.query(subQuery, [userId]);
  
  if (subResult.rows[0]) {
    return {
      hasAccess: true,
      type: 'subscription',
      subscription: subResult.rows[0]
    };
  }

  // Check free tier usage
  const usageQuery = `SELECT * FROM gpa_usage WHERE user_id = $1`;
  let usageResult = await pool.query(usageQuery, [userId]);
  
  // Create usage record if doesn't exist
  if (usageResult.rows.length === 0) {
    const createQuery = `INSERT INTO gpa_usage (user_id, usage_count) VALUES ($1, 0) RETURNING *`;
    usageResult = await pool.query(createQuery, [userId]);
  }
  
  const usage = usageResult.rows[0];
  
  if (usage.usage_count < FREE_USAGE_LIMIT) {
    return {
      hasAccess: true,
      type: 'free',
      remaining: FREE_USAGE_LIMIT - usage.usage_count,
      usageCount: usage.usage_count
    };
  }
  
  return {
    hasAccess: false,
    type: 'limit_reached',
    usageCount: usage.usage_count
  };
}

// Increment usage counter
async function incrementUsage(userId) {
  const query = `UPDATE gpa_usage SET usage_count = usage_count + 1 WHERE user_id = $1 RETURNING usage_count`;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

// Generate study notes
exports.generateNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { topic, educationLevel } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const access = await checkGPAAccess(userId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'GPA usage limit reached',
        requiresSubscription: true,
        message: `You've used all ${FREE_USAGE_LIMIT} free AI generations. Subscribe to GPA for unlimited access!`,
        prices: { annual: 700, semester: 450 }
      });
    }

    const result = await aiService.generateNotes(topic, educationLevel || 'university');

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      notes: result.content,
      topic,
      educationLevel: educationLevel || 'university',
      generatedAt: new Date(),
      accessInfo: access.type === 'free' ? {
        remaining: access.remaining - 1,
        limit: FREE_USAGE_LIMIT
      } : { type: 'unlimited' }
    });
  } catch (error) {
    console.error('Generate notes error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate notes' });
  }
};

// Generate practice test
exports.generateTest = async (req, res) => {
  try {
    const userId = req.userId;
    const { subject, topics, numQuestions, difficulty } = req.body;

    if (!subject || !topics) {
      return res.status(400).json({ error: 'Subject and topics are required' });
    }

    const access = await checkGPAAccess(userId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'GPA usage limit reached',
        requiresSubscription: true,
        message: `You've used all ${FREE_USAGE_LIMIT} free AI generations. Subscribe to GPA for unlimited access!`
      });
    }

    const result = await aiService.generateTest(
      subject,
      topics,
      numQuestions || 10,
      difficulty || 'medium'
    );

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      test: result.content,
      subject,
      topics,
      generatedAt: new Date(),
      accessInfo: access.type === 'free' ? {
        remaining: access.remaining - 1,
        limit: FREE_USAGE_LIMIT
      } : { type: 'unlimited' }
    });
  } catch (error) {
    console.error('Generate test error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate test' });
  }
};

// Answer a question
exports.answerQuestion = async (req, res) => {
  try {
    const userId = req.userId;
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const access = await checkGPAAccess(userId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'GPA usage limit reached',
        requiresSubscription: true
      });
    }

    const result = await aiService.answerQuestion(question, context);

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      answer: result.content,
      question,
      answeredAt: new Date(),
      accessInfo: access.type === 'free' ? {
        remaining: access.remaining - 1
      } : { type: 'unlimited' }
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
};

// Conversational chat — DeepSeek R1 sees the full message history so it
// can hold a real multi-turn conversation. Used by the Lwazi chat UI.
exports.chat = async (req, res) => {
  try {
    const userId = req.userId;
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    // Sanitise + cap history to the last 20 turns to keep prompts small
    const safeMessages = messages
      .filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'))
      .slice(-20)
      .map((m) => ({ role: m.role, content: String(m.content) }));

    if (safeMessages.length === 0) {
      return res.status(400).json({ error: 'No valid messages provided' });
    }

    const access = await checkGPAAccess(userId);
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'Lwazi requires an active subscription',
        requiresSubscription: true,
      });
    }

    const result = await aiService.chat(safeMessages);

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      answer: result.content,
      reasoning: result.reasoning,
      answeredAt: new Date(),
      accessInfo: access.type === 'free'
        ? { remaining: access.remaining - 1 }
        : { type: 'unlimited' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to get response' });
  }
};

// Analyze content
exports.analyzeContent = async (req, res) => {
  try {
    const userId = req.userId;
    const { content, analysisType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const access = await checkGPAAccess(userId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'GPA usage limit reached',
        requiresSubscription: true
      });
    }

    const result = await aiService.analyzeContent(content, analysisType || 'summary');

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      analysis: result.content,
      analysisType: analysisType || 'summary',
      analyzedAt: new Date(),
      accessInfo: access.type === 'free' ? {
        remaining: access.remaining - 1
      } : { type: 'unlimited' }
    });
  } catch (error) {
    console.error('Analyze content error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze content' });
  }
};

// Check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const access = await checkGPAAccess(userId);

    if (access.hasAccess && access.type === 'subscription') {
      res.json({
        hasSubscription: true,
        subscription: {
          type: access.subscription.subscription_type,
          endDate: access.subscription.end_date,
          daysRemaining: Math.ceil((new Date(access.subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        }
      });
    } else if (access.hasAccess && access.type === 'free') {
      res.json({
        hasSubscription: false,
        freeTier: {
          used: access.usageCount,
          remaining: access.remaining,
          limit: FREE_USAGE_LIMIT
        },
        prices: { annual: 700, semester: 450 }
      });
    } else {
      res.json({
        hasSubscription: false,
        limitReached: true,
        message: 'You have used all your free AI generations. Subscribe to continue.',
        prices: { annual: 700, semester: 450 }
      });
    }
  } catch (error) {
    console.error('Check subscription error:', error);
    res.status(500).json({ error: 'Failed to check subscription' });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { subscriptionType, paymentReference } = req.body;

    if (!subscriptionType || !['annual', 'semester'].includes(subscriptionType)) {
      return res.status(400).json({ error: 'Invalid subscription type' });
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

// Analyze uploaded PDF content
exports.analyzePDF = async (req, res) => {
  try {
    const userId = req.userId;
    const { pdfText, analysisType } = req.body;

    if (!pdfText) {
      return res.status(400).json({ error: 'PDF text content is required' });
    }

    // Check if it's too long (max ~15000 characters)
    if (pdfText.length > 15000) {
      return res.status(400).json({ 
        error: 'PDF content is too long. Please upload a smaller document (max ~10 pages)' 
      });
    }

    const access = await checkGPAAccess(userId);
    
    if (!access.hasAccess) {
      return res.status(403).json({
        error: 'GPA usage limit reached',
        requiresSubscription: true,
        message: `You've used all ${FREE_USAGE_LIMIT} free AI generations. Subscribe to GPA for unlimited access!`
      });
    }

    const result = await aiService.analyzeContent(
      pdfText, 
      analysisType || 'summary'
    );

    if (access.type === 'free') {
      await incrementUsage(userId);
    }

    res.json({
      success: true,
      analysis: result.content,
      analysisType: analysisType || 'summary',
      generatedAt: new Date(),
      accessInfo: access.type === 'free' ? {
        remaining: access.remaining - 1,
        limit: FREE_USAGE_LIMIT
      } : { type: 'unlimited' }
    });
  } catch (error) {
    console.error('Analyze PDF error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze PDF' });
  }
};

module.exports = exports;