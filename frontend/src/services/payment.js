import api from './api';

class PaymentService {
  // Generate payment and get PayFast form data
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

  // Submit payment to PayFast
  submitToPayFast(paymentUrl, paymentData) {
    // Create a form dynamically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;

    // Add all payment data as hidden inputs
    Object.keys(paymentData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = paymentData[key];
      form.appendChild(input);
    });

    // Submit form
    document.body.appendChild(form);
    form.submit();
  }
}

const paymentService = new PaymentService();
export default paymentService;
