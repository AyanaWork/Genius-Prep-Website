import api from './api';

class PaymentService {
  /**
   * Initiates GPA subscription payment
   * @param {string} subscriptionType - 'FREE', 'BASIC', 'PREMIUM', 'UNLIMITED'
   * @returns {Promise} Payment data for PayFast
   */
  async initiateGPAPayment(subscriptionType) {
    try {
      const response = await api.post('/payments/gpa/initiate', {
        subscriptionType
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating GPA payment:', error);
      throw error;
    }
  }

  /**
   * Initiates tutor booking payment
   * @param {Object} bookingData - Booking details
   * @returns {Promise} Payment data for PayFast
   */
  async initiateBookingPayment(bookingData) {
    try {
      const response = await api.post('/payments/booking/initiate', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error initiating booking payment:', error);
      throw error;
    }
  }

  /**
   * Generic payment initiation 
   * @param {string} planType - Plan type 
   * @returns {Promise} Payment data
   */
  async initiatePayment(planType) {
    // If it's a subscription plan
    if (['FREE', 'BASIC', 'PREMIUM', 'UNLIMITED'].includes(planType)) {
      return this.initiateGPAPayment(planType);
    }
    
    // Otherwise treat as custom payment
    const response = await api.post('/payments/generate', {
      subscriptionType: planType
    });
    return response.data;
  }

  /**
   * Checks payment status
   * @param {number} paymentId - Payment ID
   * @returns {Promise} Payment status
   */
  async checkPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  /**
   * Gets payment history
   * @returns {Promise} List of payments
   */
  async getPaymentHistory() {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Gets available subscription plans
   * @returns {Promise} List of plans
   */
  async getSubscriptionPlans() {
    try {
      const response = await api.get('/payments/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw error;
    }
  }

  /**
   * Gets tutor earnings 
   * @returns {Promise} Earnings summary and history
   */
  async getTutorEarnings() {
    try {
      const response = await api.get('/payments/tutor/earnings');
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor earnings:', error);
      throw error;
    }
  }

  /**
   * Gets GPA subscription pricing
   * @returns {Promise} Pricing structure for daily, monthly, semester
   */
  async getGPAPricing() {
    try {
      const response = await api.get('/payments/gpa/pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching GPA pricing:', error);
      throw error;
    }
  }

  /**
   * Creates GPA subscription payment (NEW PRICING)
   * @param {string} subscriptionType - 'daily', 'monthly', 'semester'
   * @returns {Promise} Payment data for PayFast
   */
  async createGPASubscription(subscriptionType) {
    try {
      const response = await api.post('/payments/gpa/subscribe', {
        subscriptionType
      });
      return response.data;
    } catch (error) {
      console.error('Error creating GPA subscription:', error);
      throw error;
    }
  }

  /**
   * Creates booking payment (with hours)
   * @param {number} bookingId - Booking ID
   * @returns {Promise} Payment data for PayFast
   */
  async createBookingPayment(bookingId) {
    try {
      const response = await api.post('/payments/booking', { bookingId });
      return response.data;
    } catch (error) {
      console.error('Error creating booking payment:', error);
      throw error;
    }
  }

  /**
   * Checks subscription status
   * @returns {Promise} Subscription status and details
   */
  async checkSubscriptionStatus() {
    try {
      const response = await api.get('/payments/subscription/status');
      return response.data;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  }

  /**
   * Submit payment data to PayFast
   * Creates a form and submits it to PayFast payment page
   * @param {string} paymentUrl - PayFast payment URL
   * @param {Object} paymentData - Payment form data
   */
  submitToPayFast(paymentUrl, paymentData) {
    // Create a form dynamically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    form.target = '_self'; // Open in same window

    // Adds all payment data as hidden inputs
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    // Adds form to page and submit
    document.body.appendChild(form);
    form.submit();
    
  }

  /**
   * Formats amount for display
   * @param {number} amount - Amount in rands
   * @returns {string} 
   */
  formatAmount(amount) {
    return `R ${parseFloat(amount).toFixed(2)}`;
  }

  /**
   * Calculates revenue split for display
   * @param {number} totalAmount - Total booking amount
   * @param {number} tutorPercentage - Tutor percentage (default 0.70)
   * @returns {Object} Split amounts
   */
  calculateSplit(totalAmount, tutorPercentage = 0.70) {
    const total = parseFloat(totalAmount);
    const tutorAmount = Math.round(total * tutorPercentage * 100) / 100;
    const companyAmount = Math.round(total * (1 - tutorPercentage) * 100) / 100;

    return {
      total: this.formatAmount(total),
      tutorAmount: this.formatAmount(tutorAmount),
      companyAmount: this.formatAmount(companyAmount),
      tutorPercentage: `${(tutorPercentage * 100).toFixed(0)}%`,
      companyPercentage: `${((1 - tutorPercentage) * 100).toFixed(0)}%`
    };
  }
}

const paymentService = new PaymentService();
export default paymentService;