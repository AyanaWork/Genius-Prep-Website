const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Use latest GPT-4 model
const GPT_MODEL = 'gpt-4-turbo-2024-04-09';

class OpenAIService {
  // Generate study notes from a topic
  async generateNotes(topic, educationLevel = 'university') {
    try {
      const prompt = `Create comprehensive, well-structured study notes on "${topic}" for ${educationLevel} students in South Africa.

FORMATTING REQUIREMENTS:
- Use **bold** for key terms, definitions, and important concepts
- Use **bold** for all formulas and equations
- Structure content with clear headings using ## and ###
- Use bullet points for lists
- Add blank lines between sections for readability
- Highlight critical information

CONTENT STRUCTURE:
1. ## Key Concepts and Definitions
   - Define main terms with **bold** terminology
   
2. ## Important Formulas and Principles
   - Present each formula clearly with **bold** formatting
   - Explain what each variable means
   
3. ## Detailed Explanation
   - Break down complex ideas into digestible parts
   - Use examples relevant to South African context
   
4. ## Practical Examples
   - Provide 2-3 worked examples
   - Show step-by-step solutions
   
5. ## Summary and Key Takeaways
   - **Bold** the most important points
   - List essential facts to remember
   
6. ## Study Tips
   - Effective methods to master this topic

Make it visually clear, easy to scan, and perfect for studying.`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert academic tutor for South African students. You create exceptionally well-formatted, comprehensive study materials with proper use of **bold** formatting for emphasis. Your notes are known for being clear, structured, and easy to study from."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
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
    try {
      const prompt = `Create a well-formatted practice test for ${subject} covering: ${topics}

REQUIREMENTS:
- Number of questions: ${numQuestions}
- Difficulty: ${difficulty}
- All formulas and equations must be in **bold**
- Question numbers in **bold**
- Clear section breaks between questions

FORMAT:
**Question 1:** [Question text]
- If mathematical: Show equation in **bold**
- Multiple choice: Label options clearly (a, b, c, d)

**Question 2:** [Question text]
...

Include:
1. Mix of question types (multiple choice, short answer, problem-solving)
2. Clear, unambiguous questions
3. Appropriate difficulty for ${difficulty} level
4. Relevant to South African curriculum where applicable

After all questions, provide:

## Answer Key
**Q1:** [Answer with explanation if needed]
**Q2:** [Answer with explanation if needed]
...

Make mathematics questions have properly formatted **bold equations**.`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert exam creator for South African students. You create well-structured tests with proper formatting. All equations and formulas are in **bold**. Questions are clear and appropriate for the specified difficulty level."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.8
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
    try {
      let prompt = `Question: ${question}`;
      
      if (context) {
        prompt = `Context: ${context}\n\n${prompt}`;
      }
      
      prompt += `\n\nProvide a comprehensive, well-formatted answer:
- Use **bold** for key terms and important points
- For mathematics: Use **bold** for all formulas and equations
- Structure your answer with headings if it's complex
- Include step-by-step explanations for problem-solving
- Add examples if helpful
- Keep paragraphs separated for readability`;

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert tutor helping South African students. Provide clear, well-formatted answers with **bold** emphasis on key concepts, formulas, and important information. For math problems, show all steps clearly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2500,
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
    try {
      let prompt = '';
      
      if (analysisType === 'summary') {
        prompt = `Analyze and summarize this content comprehensively:

${content}

FORMATTING REQUIREMENTS:
- Use **bold** for all key principles and main ideas
- Structure with clear ## headings
- Separate paragraphs with blank lines
- Highlight important formulas in **bold**
- Use bullet points for lists

Provide:
1. ## Main Topics Covered
2. ## Key Principles (with **bold** emphasis)
3. ## Important Concepts Explained
4. ## Critical Formulas/Equations (if any)
5. ## Summary Points`;
      } else if (analysisType === 'question_paper') {
        prompt = `This is a question paper or exam. Provide detailed solutions:

${content}

FORMAT:
For each question:
**Question [Number]:** [Restate question]

**Solution:**
- Show all steps clearly
- Use **bold** for formulas
- Explain your reasoning
- Provide final answer in **bold**

**Marking Criteria:** [If applicable]`;
      }

      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert academic analyst. You create well-structured, comprehensive analyses with proper **bold** formatting for emphasis. Your summaries are known for highlighting key information clearly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3500,
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