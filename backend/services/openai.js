const OpenAI = require('openai');

let openai = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.warn('WARNING: OPENAI_API_KEY not set - GPA features will be disabled');
}

// Faster, cost-efficient model
const GPT_MODEL = 'gpt-4o-mini';

class OpenAIService {
  // Generate study notes from a topic
  async generateNotes(topic, educationLevel = 'university') {
    if (!openai) throw new Error('GPA service not available - API key not configured');
    try {
      const prompt = `Create comprehensive, well-structured study notes on "${topic}" for ${educationLevel} students in South Africa.

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

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert academic tutor for South African students. Always format mathematical expressions using LaTeX: $...$ for inline math and $$...$$ for display math. Never write fractions as (a)/(b) — always use \\frac{a}{b} inside $ $."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI notes generation error:', error);
      throw this.handleError(error);
    }
  }

  // Generate a practice test/exam
  async generateTest(subject, topics, numQuestions = 10, difficulty = 'medium') {
    if (!openai) throw new Error('GPA service not available - API key not configured');
    try {
      const prompt = `Create a well-formatted practice test for ${subject} covering: ${topics}

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

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are GPA (Genius Prep Accelerator), an expert academic tutor for South African students. Always format math using LaTeX: $...$ for inline and $$...$$ for display equations. Use \\frac{}{} for fractions, x^{2} for exponents, \\sqrt{} for roots. If a student writes in Zulu, Xhosa, Afrikaans, or Sotho, respond in that language."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI test generation error:', error);
      throw this.handleError(error);
    }
  }

  // Answer a question
  async answerQuestion(question, context = null) {
    if (!openai) throw new Error('GPA service not available - API key not configured');
    try {
      let prompt = `Question: ${question}`;
      if (context) prompt = `Context: ${context}\n\n${prompt}`;

      prompt += `\n\nProvide a clear, well-formatted answer. Use LaTeX for all math expressions: $...$ for inline math and $$...$$ for displayed equations.`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert tutor helping South African students. Always format math using LaTeX: $...$ for inline and $$...$$ for display equations. Use \\frac{}{} for fractions, x^{2} for exponents, \\sqrt{} for roots. Show all working step by step."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI answer question error:', error);
      throw this.handleError(error);
    }
  }

  // Analyze content (for PDF summaries)
  async analyzeContent(content, analysisType = 'summary') {
    if (!openai) throw new Error('GPA service not available - API key not configured');
    try {
      let prompt = '';

      if (analysisType === 'summary') {
        prompt = `Analyze and summarize this content comprehensively:

${content}

Use ## headings, **bold** for key points, and LaTeX ($...$) for any mathematical expressions.

Provide:
1. ## Main Topics Covered
2. ## Key Principles
3. ## Important Concepts
4. ## Critical Formulas/Equations (use LaTeX)
5. ## Summary Points`;
      } else if (analysisType === 'question_paper') {
        prompt = `This is a question paper. Provide detailed solutions using LaTeX for all math:

${content}

For each question show full working with LaTeX equations.`;
      }

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert academic analyst. Format all math using LaTeX: $...$ inline and $$...$$ for display. Use \\frac{}{} for fractions."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI analyze content error:', error);
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    if (error.code === 'insufficient_quota') {
      return new Error('OpenAI API quota exceeded. Please contact support.');
    } else if (error.status === 429) {
      return new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error.status === 401) {
      return new Error('Invalid API key. Please contact support.');
    }
    return new Error('Failed to process request. Please try again.');
  }
}

module.exports = new OpenAIService();