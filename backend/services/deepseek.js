/**
 * Lwazi AI service — powered by DeepSeek R1.
 *
 * DeepSeek's REST API is OpenAI-compatible, so we reuse the official `openai`
 * SDK and just point baseURL at https://api.deepseek.com/v1.
 *
 *   - "deepseek-reasoner"  → DeepSeek R1 (reasoning model)
 *   - "deepseek-chat"      → DeepSeek V3 (faster, no chain-of-thought)
 *
 * Required env:
 *   DEEPSEEK_API_KEY      (required)
 *   DEEPSEEK_MODEL        (optional, defaults to "deepseek-reasoner")
 *   DEEPSEEK_BASE_URL     (optional, defaults to "https://api.deepseek.com/v1")
 */

const OpenAI = require('openai');

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-reasoner';

let client = null;

if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'YOUR_DEEPSEEK_API_KEY_HERE') {
  client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });
} else {
  console.warn('WARNING: DEEPSEEK_API_KEY not set - Lwazi AI features will be disabled');
}

const SYSTEM_PROMPT_BASE =
  'You are Lwazi, an expert academic tutor for South African students built on top of DeepSeek R1. ' +
  'Always format mathematical expressions using LaTeX: $...$ for inline math and $$...$$ for display math. ' +
  'Use \\frac{a}{b} for fractions, x^{2} for exponents, \\sqrt{x} for roots — never write fractions as (a)/(b). ' +
  'If a student writes in Zulu, Xhosa, Afrikaans, Sotho, or any South African language, respond in that language. ' +
  'Show all working step by step and keep explanations clear, encouraging, and exam-relevant.';

/**
 * Helper that sends a chat completion request to DeepSeek and unwraps the response.
 * DeepSeek R1 returns a `reasoning_content` field with chain-of-thought; we strip
 * that out and only return the final answer in `content`.
 */
async function chat(messages, { maxTokens = 2000, temperature = 0.7 } = {}) {
  if (!client) {
    throw new Error('Lwazi AI service not available - DEEPSEEK_API_KEY not configured');
  }

  const response = await client.chat.completions.create({
    model: DEEPSEEK_MODEL,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const choice = response.choices && response.choices[0];
  if (!choice || !choice.message) {
    throw new Error('Empty response from DeepSeek');
  }

  return {
    success: true,
    content: choice.message.content || '',
    reasoning: choice.message.reasoning_content || null,
    usage: response.usage,
  };
}

class LwaziService {
  // Generate study notes from a topic
  async generateNotes(topic, educationLevel = 'university') {
    try {
      const userPrompt = `Create comprehensive, well-structured study notes on "${topic}" for ${educationLevel} students in South Africa.

FORMATTING REQUIREMENTS:
- Use **bold** for key terms, definitions, and important concepts
- For ALL math: use $...$ for inline equations and $$...$$ for display equations (LaTeX format)
- Structure content with clear headings using ## and ###
- Use bullet points for lists
- Add blank lines between sections for readability

MATH FORMATTING RULES (very important):
- Fractions: use \\frac{numerator}{denominator} inside $ $
- Exponents: use x^{2} inside $ $
- Square roots: use \\sqrt{x} inside $ $
- Example: The quadratic formula is $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

CONTENT STRUCTURE:
1. ## Key Concepts and Definitions
2. ## Important Formulas and Principles
3. ## Detailed Explanation
4. ## Practical Examples
5. ## Summary and Key Takeaways
6. ## Study Tips

Make it visually clear, easy to scan, and perfect for studying.`;

      return await chat(
        [
          { role: 'system', content: SYSTEM_PROMPT_BASE },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 2000, temperature: 0.7 }
      );
    } catch (error) {
      console.error('DeepSeek notes generation error:', error);
      throw this.handleError(error);
    }
  }

  // Generate a practice test/exam
  async generateTest(subject, topics, numQuestions = 10, difficulty = 'medium') {
    try {
      const userPrompt = `Create a well-formatted practice test for ${subject} covering: ${topics}

REQUIREMENTS:
- Number of questions: ${numQuestions}
- Difficulty: ${difficulty}
- Use LaTeX for ALL math: $...$ inline, $$...$$ for display equations
- Question numbers in **bold**

FORMAT:
**Question 1:** [Question text with $math$ where needed]

Include a mix of question types. After all questions provide:

## Answer Key
**Q1:** [Answer with LaTeX math where needed]`;

      return await chat(
        [
          { role: 'system', content: SYSTEM_PROMPT_BASE },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 2500, temperature: 0.7 }
      );
    } catch (error) {
      console.error('DeepSeek test generation error:', error);
      throw this.handleError(error);
    }
  }

  // Answer a question
  async answerQuestion(question, context = null) {
    try {
      let userPrompt = `Question: ${question}`;
      if (context) userPrompt = `Context: ${context}\n\n${userPrompt}`;
      userPrompt +=
        '\n\nProvide a clear, well-formatted answer. Use LaTeX for all math expressions: ' +
        '$...$ for inline math and $$...$$ for displayed equations. Show working step by step.';

      return await chat(
        [
          { role: 'system', content: SYSTEM_PROMPT_BASE },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 1800, temperature: 0.7 }
      );
    } catch (error) {
      console.error('DeepSeek answer question error:', error);
      throw this.handleError(error);
    }
  }

  // Analyze content (for PDF summaries)
  async analyzeContent(content, analysisType = 'summary') {
    try {
      let userPrompt = '';

      if (analysisType === 'summary') {
        userPrompt = `Analyze and summarize this content comprehensively:

${content}

Use ## headings, **bold** for key points, and LaTeX ($...$) for any mathematical expressions.

Provide:
1. ## Main Topics Covered
2. ## Key Principles
3. ## Important Concepts
4. ## Critical Formulas/Equations (use LaTeX)
5. ## Summary Points`;
      } else if (analysisType === 'question_paper') {
        userPrompt = `This is a question paper. Provide detailed solutions using LaTeX for all math:

${content}

For each question show full working with LaTeX equations.`;
      } else {
        userPrompt = `Analyze the following content and provide insights:\n\n${content}`;
      }

      return await chat(
        [
          { role: 'system', content: SYSTEM_PROMPT_BASE },
          { role: 'user', content: userPrompt },
        ],
        { maxTokens: 2500, temperature: 0.7 }
      );
    } catch (error) {
      console.error('DeepSeek analyze content error:', error);
      throw this.handleError(error);
    }
  }

  // Generic chat passthrough — useful for the conversational Lwazi UI
  async chat(messages, options = {}) {
    try {
      const formatted = [
        { role: 'system', content: SYSTEM_PROMPT_BASE },
        ...messages.filter((m) => m && m.role && m.content).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ];
      return await chat(formatted, options);
    } catch (error) {
      console.error('DeepSeek chat error:', error);
      throw this.handleError(error);
    }
  }

  // Map common API errors to friendly messages
  handleError(error) {
    if (!error) return new Error('Failed to process request. Please try again.');

    const status = error.status || error.response?.status;
    const code = error.code;

    if (status === 401) {
      return new Error('Lwazi AI is not authorized. Please contact support.');
    }
    if (status === 402 || code === 'insufficient_quota') {
      return new Error('Lwazi AI quota exceeded. Please contact support.');
    }
    if (status === 429) {
      return new Error('Too many requests right now. Please try again in a moment.');
    }
    if (status >= 500 && status < 600) {
      return new Error('Lwazi AI is temporarily unavailable. Please try again shortly.');
    }
    return new Error(error.message || 'Failed to process request. Please try again.');
  }
}

module.exports = new LwaziService();