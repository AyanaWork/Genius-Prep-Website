import api from './api';

class PaymentService {

  /**
   * Initiates GPA subscription payment via Paystack
   * @param {string} planType - 'daily', 'monthly', 'semester', 'annual'
   */
  async initiatePayment(planType) {
    try {
      const response = await api.post('/payments/generate', {
        subscriptionType: planType
      });
      return {
        success: true,
        paymentUrl: response.data.paymentUrl,
        reference: response.data.reference,
        paymentId: response.data.paymentId
      };
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  /**
   * Alias for initiatePayment
   */
  async initializePayment(subscriptionType) {
    return this.initiatePayment(subscriptionType);
  }

  /**
   * Creates booking payment via Paystack
   * @param {number} bookingId - Booking ID
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
   * Redirects user to Paystack payment page
   * @param {string} paymentUrl - Paystack authorization URL
   */
  redirectToPaystack(paymentUrl) {
    window.location.href = paymentUrl;
  }

  /**
   * Checks payment status
   * @param {string} paymentId
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
   * Checks subscription status
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
   * Gets payment history
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
   * Gets tutor earnings
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
   * Formats amount for display
   */
  formatAmount(amount) {
    return `R ${parseFloat(amount).toFixed(2)}`;
  }

  /**
   * Calculates revenue split
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