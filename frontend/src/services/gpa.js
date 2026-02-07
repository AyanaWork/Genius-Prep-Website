import api from './api';

class GPAService {
  // Check subscription status
  async checkSubscription() {
    const response = await api.get('/gpa/subscription/status');
    return response.data;
  }

  // Create subscription
  async createSubscription(subscriptionType, paymentReference) {
    const response = await api.post('/gpa/subscription/create', {
      subscriptionType,
      paymentReference
    });
    return response.data;
  }

  // Generate study notes
  async generateNotes(topic, educationLevel) {
    const response = await api.post('/gpa/generate-notes', {
      topic,
      educationLevel
    });
    return response.data;
  }

  // Generate practice test
  async generateTest(subject, topics, numQuestions, difficulty) {
    const response = await api.post('/gpa/generate-test', {
      subject,
      topics,
      numQuestions,
      difficulty
    });
    return response.data;
  }

  // Answer a question
  async answerQuestion(question, context) {
    const response = await api.post('/gpa/answer-question', {
      question,
      context
    });
    return response.data;
  }

  // Analyze content
  async analyzeContent(content, analysisType) {
    const response = await api.post('/gpa/analyze-content', {
      content,
      analysisType
    });
    return response.data;
  }

  // Generate memo
  async generateMemo(questions) {
    const response = await api.post('/gpa/generate-memo', {
      questions
    });
    return response.data;
  }

  // Initiate payment
  async initiatePayment(subscriptionType) {
    const response = await api.post('/payments/generate', {
      subscriptionType
    });
    return response.data;
  }

  // Check payment status
  async checkPaymentStatus(paymentId) {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  }
}

const gpaService = new GPAService();
export default gpaService;
