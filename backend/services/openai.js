const OpenAI = require('openai');

let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error.message);
}

class OpenAIService {
  
  async _makeRequest(requestFn, errorContext) {
    if (!openai) {
      throw new Error('OpenAI client not initialized. Check your API key.');
    }

    try {
      return await requestFn();
    } catch (error) {
      console.error(`OpenAI ${errorContext} error:`, error);
      
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please contact support.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key. Please contact support.');
      } else if (error.message?.includes('API key')) {
        throw new Error('API key configuration error. Please contact support.');
      }
      
      throw new Error(`Failed to ${errorContext}`);
    }
  }

  async generateNotes(topic, educationLevel = 'university') {
    return this._makeRequest(async () => {
      const prompt = `Create comprehensive study notes on "${topic}" for ${educationLevel} students in South Africa.

Include:
1. Key Concepts and Definitions
2. Important Formulas or Principles (if applicable)
3. Practical Examples
4. Summary Points
5. Study Tips

Format the response with clear headers and bullet points. Make it easy to understand and study from.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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
    }, 'generate notes');
  }

  async generateTest(subject, topics, numQuestions = 10, difficulty = 'medium') {
    return this._makeRequest(async () => {
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
    }, 'generate test');
  }

  async answerQuestion(question, context = '') {
    return this._makeRequest(async () => {
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
    }, 'answer question');
  }

  async analyzeContent(content, analysisType = 'summary') {
    return this._makeRequest(async () => {
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
    }, 'analyze content');
  }

  async translateContent(content, targetLanguage) {
    return this._makeRequest(async () => {
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
    }, 'translate content');
  }
}

module.exports = new OpenAIService();