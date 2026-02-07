module.exports = {
  // Sandbox configuration (for testing)
  sandbox: {
    merchantId: process.env.PAYFAST_SANDBOX_MERCHANT_ID || '10000100',
    merchantKey: process.env.PAYFAST_SANDBOX_MERCHANT_KEY || '46f0cd694581a',
    passphrase: process.env.PAYFAST_SANDBOX_PASSPHRASE || 'jt7NOE43FZPn',
    url: 'https://sandbox.payfast.co.za/eng/process',
    validateUrl: 'https://sandbox.payfast.co.za/eng/query/validate'
  },
  
  // Production configuration (for live payments)
  production: {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    url: 'https://www.payfast.co.za/eng/process',
    validateUrl: 'https://www.payfast.co.za/eng/query/validate'
  },
  
  // Determine which environment to use
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  
  // Get current configuration
  getConfig() {
    const config = this[this.environment];
    console.log(`Using PayFast ${this.environment} environment`);
    return config;
  },
  
  // Payment URLs
  returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
  cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
  notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/notify`,
  
  // GPA Subscription Plans
  subscriptionPlans: {
    FREE: {
      name: 'Free Trial',
      price: 0,
      queries: 5,
      duration: 30, // days
      features: ['5 AI queries total', 'Basic support', 'Note generation']
    },
    BASIC: {
      name: 'Basic',
      price: 99.00, // R99
      queries: 50,
      duration: 30,
      features: ['50 AI queries/month', 'Email support', 'Note generation', 'Practice tests']
    },
    PREMIUM: {
      name: 'Premium',
      price: 199.00, // R199
      queries: 200,
      duration: 30,
      features: ['200 AI queries/month', 'Priority support', 'Advanced AI features', 'Custom study plans', 'Progress tracking']
    },
    UNLIMITED: {
      name: 'Unlimited',
      price: 349.00, // R349
      queries: -1, // unlimited
      duration: 30,
      features: ['Unlimited AI queries', '24/7 priority support', 'All premium features', 'Personalized tutoring recommendations', 'Exam preparation tools']
    }
  },
  
  // Commission structure for tutor bookings
  commission: {
    tutorPercentage: 0.70, // 70% to tutor 
    companyPercentage: 0.30, // 30% to company
    
    // Calculate split
    calculateSplit(totalAmount) {
      const tutorAmount = Math.round(totalAmount * this.tutorPercentage * 100) / 100;
      const companyAmount = Math.round(totalAmount * this.companyPercentage * 100) / 100;
      
      return {
        total: totalAmount,
        tutorAmount,
        companyAmount,
        tutorPercentage: this.tutorPercentage * 100,
        companyPercentage: this.companyPercentage * 100
      };
    }
  }
};
