const crypto = require('crypto');
const axios = require('axios');

class PayFastUtils {
  
  generateSignature(data, passphrase = null) {
    // Creates parameter string
    let pfOutput = '';
    
    // Sort the data by key (alphabetically)
    const sortedData = {};
    Object.keys(data).sort().forEach(key => {
      sortedData[key] = data[key];
    });
    
    for (let key in sortedData) {
      if (sortedData.hasOwnProperty(key) && key !== 'signature') {
        pfOutput += `${key}=${encodeURIComponent(sortedData[key].toString().trim()).replace(/%20/g, '+')}&`;
      }
    }
    
    // Removes last ampersand
    pfOutput = pfOutput.slice(0, -1);
    
    // Add passphrase if provided
    if (passphrase !== null) {
      pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    
    // Generates MD5 hash
    return crypto.createHash('md5').update(pfOutput).digest('hex');
  }
  
  
  validateSignature(data, passphrase, signature) {
    const calculatedSignature = this.generateSignature(data, passphrase);
    return calculatedSignature === signature;
  }
  
  async verifyPaymentWithPayFast(pfData, pfHost = 'sandbox.payfast.co.za') {
    try {
      const response = await axios.post(
        `https://${pfHost}/eng/query/validate`,
        new URLSearchParams(pfData).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000 // 10 second timeout
        }
      );
      
      return response.data === 'VALID';
    } catch (error) {
      console.error('PayFast validation error:', error.message);
      return false;
    }
  }
  
  /**
   * Check if payment is from valid PayFast IP
   * PayFast only sends ITN from specific IPs
   */
  isValidPayFastIP(ipAddress) {
    const validIPs = [
      '197.97.145.144',
      '197.97.145.145',
      '197.97.145.146',
      '197.97.145.147',
      '197.97.145.148',
      '41.74.179.194',
      '41.74.179.195',
      '41.74.179.196',
      '41.74.179.197',
      '41.74.179.198',
      '41.74.179.199',
      '41.74.179.200',
      '41.74.179.201',
      '41.74.179.202',
      '41.74.179.203',
      '41.74.179.204',
      '41.74.179.205',
      '41.74.179.206',
      '41.74.179.207'
    ];
    
    // In sandbox mode, allow any IP for testing
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    
    return validIPs.includes(ipAddress);
  }
  
  /**
   * Get client IP address from request
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           req.connection.socket?.remoteAddress;
  }
  
  /**
   * Format amount for PayFast (must be in format: 100.00)
   */
  formatAmount(amount) {
    return parseFloat(amount).toFixed(2);
  }
  
  /**
   * Generate unique merchant payment ID
   */
  generatePaymentId(userId, type) {
    const timestamp = Date.now();
    return `${type}_${userId}_${timestamp}`;
  }
  
  /**
   * Create PayFast payment data object
   */
  createPaymentData(config, paymentDetails) {
    const data = {
      // Merchant details
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: config.returnUrl,
      cancel_url: config.cancelUrl,
      notify_url: config.notifyUrl,
      
      // Buyer details
      name_first: paymentDetails.firstName,
      name_last: paymentDetails.lastName,
      email_address: paymentDetails.email,
      
      // Transaction details
      m_payment_id: paymentDetails.paymentId,
      amount: this.formatAmount(paymentDetails.amount),
      item_name: paymentDetails.itemName,
      item_description: paymentDetails.itemDescription || '',
      
      // Optional custom fields
      custom_str1: paymentDetails.userId.toString(),
      custom_str2: paymentDetails.type || '',
      custom_int1: paymentDetails.customInt1 || '',
      
      // Email confirmation
      email_confirmation: 1,
      confirmation_address: paymentDetails.email
    };
    
    // Generate signature
    data.signature = this.generateSignature(data, config.passphrase);
    
    return data;
  }
  
  /**
   * Calculate revenue split for tutor bookings
   */
  calculateRevenueSplit(totalAmount, tutorPercentage = 0.70) {
    const total = parseFloat(totalAmount);
    const tutorAmount = Math.round(total * tutorPercentage * 100) / 100;
    const companyAmount = Math.round(total * (1 - tutorPercentage) * 100) / 100;
    
    return {
      total: total.toFixed(2),
      tutorAmount: tutorAmount.toFixed(2),
      companyAmount: companyAmount.toFixed(2),
      tutorPercentage: (tutorPercentage * 100).toFixed(0) + '%',
      companyPercentage: ((1 - tutorPercentage) * 100).toFixed(0) + '%'
    };
  }
  
  /**
   * Parse PayFast ITN data
   */
  parseITNData(body) {
    const data = {};
    
    // PayFast sends data as URL encoded form
    if (typeof body === 'string') {
      const params = new URLSearchParams(body);
      params.forEach((value, key) => {
        data[key] = value;
      });
    } else {
      Object.assign(data, body);
    }
    
    return data;
  }
}

module.exports = new PayFastUtils();