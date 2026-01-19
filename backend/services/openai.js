const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class OpenAIService {
  // Generate study notes from a topic
  async generateNotes(topic, educationLevel = 'university') {
    try {
      const prompt = `Create comprehensive study notes on "${topic}" for ${educationLevel} students in South Africa.

Include:
1. Key Concepts and Definitions
2. Important Formulas or Principles
3. Practical Examples
4. Summary Points
5. Study Tips

Format the response with clear headers and bullet points. Make it easy to understand and study from.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using cheaper model for notes
        messages: [
          {
            role: "system",
            content: "You are an expert academic tutor helping South African students. Provide clear, comprehensive study notes."
          },
          {
            role: "user",
            content: prompt
          }
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
      throw new Error('Failed to generate notes');
    }
  }

  // Generate a practice test/exam
  async generateTest(subject, topics, numQuestions = 10, difficulty = 'medium') {
    try {
      const prompt = `Create a practice test for ${subject} covering: ${topics}

Requirements:
- ${numQuestions} questions
- Difficulty level: ${difficulty}
- Mix of question types (multiple choice, short answer, problem-solving)
- Include mark allocation for each question

Format:
1. Question text
2. [Marks: X]
3. Space for answer

Then create a SEPARATE MEMO section with:
- Correct answers
- Step-by-step solutions
- Mark allocation breakdown`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an experienced South African teacher creating assessment materials. Follow CAPS/IEB standards."
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
      throw new Error('Failed to generate test');
    }
  }

  // Answer academic questions
  async answerQuestion(question, context = '') {
    try {
      const prompt = context 
        ? `Context: ${context}\n\nQuestion: ${question}\n\nProvide a detailed academic answer.`
        : question;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are GPA (Genius Prep Accelerator), an AI tutor helping South African students. Provide clear, accurate academic answers with examples."
          },
          {
            role: "user",
            content: prompt
          }
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
      console.error('OpenAI question answer error:', error);
      throw new Error('Failed to answer question');
    }
  }

  // Analyze text content (from PDF or manual input)
  async analyzeContent(content, analysisType = 'summary') {
    try {
      let prompt;
      
      switch (analysisType) {
        case 'summary':
          prompt = `Analyze and summarize this academic content:\n\n${content}\n\nProvide:
1. Main topics covered
2. Key concepts and definitions
3. Important points to remember
4. Study recommendations`;
          break;
        
        case 'questions':
          prompt = `Based on this content:\n\n${content}\n\nGenerate:
1. Potential exam questions
2. Practice problems
3. Study questions`;
          break;
        
        case 'explain':
          prompt = `Explain this academic content in simpler terms:\n\n${content}\n\nMake it easy to understand with examples.`;
          break;
        
        default:
          prompt = `Analyze this content:\n\n${content}`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert academic analyst helping students understand their study materials."
          },
          {
            role: "user",
            content: prompt
          }
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
      console.error('OpenAI content analysis error:', error);
      throw new Error('Failed to analyze content');
    }
  }

  // Translate content to another language
  async translateContent(content, targetLanguage) {
    try {
      const prompt = `Translate this academic content to ${targetLanguage}. Maintain academic terminology and accuracy:\n\n${content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional academic translator. Maintain technical accuracy."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI translation error:', error);
      throw new Error('Failed to translate content');
    }
  }

  // Generate memo/solutions for questions
  async generateMemo(questions) {
    try {
      const prompt = `Create a detailed memorandum (marking guideline) for these questions:\n\n${questions}\n\nInclude:
- Correct answers
- Step-by-step solutions
- Mark allocation
- Common mistakes to avoid`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are creating marking guidelines for South African academic assessments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.5
      });

      return {
        success: true,
        content: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      console.error('OpenAI memo generation error:', error);
      throw new Error('Failed to generate memo');
    }
  }
}

module.exports = new OpenAIService();