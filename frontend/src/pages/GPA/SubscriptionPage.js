import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment';
import authService from '../../services/auth';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('semester'); // Default to semester
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    semester: {
      name: '6-Month Access',
      price: 450,
      duration: '6 months',
      features: [
        'Unlimited AI study notes generation',
        'Unlimited practice tests and exams',
        'PDF document analysis',
        'Question answering assistant',
        '6 months of full access',
        'Priority support'
      ]
    },
    annual: {
      name: 'Annual Access',
      price: 700,
      duration: '12 months',
      savings: 'Save R250!',
      features: [
        'Everything in 6-Month plan',
        'Full year of unlimited access',
        'Best value for money',
        'Priority support',
        'Early access to new features',
        'Money-back guarantee'
      ]
    }
  };

  const handleSubscribe = async () => {
    if (!authService.isLoggedIn()) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Initiating subscription:', selectedPlan);
      
      const response = await paymentService.initializePayment(selectedPlan);
      
      console.log('Payment response:', response);

      if (!response.success || !response.paymentData || !response.paymentUrl) {
        throw new Error('Invalid payment response from server');
      }

      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.paymentUrl;

      // Add all payment data as hidden fields
      Object.keys(response.paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = response.paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      console.log('Submitting payment form to:', response.paymentUrl);
      form.submit();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to GPA Premium
          </h1>
          <p className="text-xl text-gray-600">
            Unlock unlimited access to AI-powered study tools
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Semester Plan */}
          <div
            onClick={() => setSelectedPlan('semester')}
            className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
              selectedPlan === 'semester'
                ? 'bg-blue-600 text-white shadow-2xl scale-105 ring-4 ring-blue-400'
                : 'bg-white text-gray-900 shadow-lg hover:shadow-xl hover:scale-102'
            }`}
          >
            {/* Selection Indicator */}
            <div className="absolute top-6 right-6">
              <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                selectedPlan === 'semester' 
                  ? 'border-white bg-white' 
                  : 'border-gray-300 bg-white'
              }`}>
                {selectedPlan === 'semester' && (
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">{plans.semester.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">R{plans.semester.price}</span>
              <span className={selectedPlan === 'semester' ? 'text-blue-100' : 'text-gray-500'}>
                /{plans.semester.duration}
              </span>
            </div>

            <ul className="space-y-3 mb-8">
              {plans.semester.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className={`w-6 h-6 mr-3 flex-shrink-0 ${
                    selectedPlan === 'semester' ? 'text-blue-200' : 'text-blue-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Annual Plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-300 ${
              selectedPlan === 'annual'
                ? 'bg-blue-600 text-white shadow-2xl scale-105 ring-4 ring-blue-400'
                : 'bg-white text-gray-900 shadow-lg hover:shadow-xl hover:scale-102'
            }`}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                BEST VALUE
              </span>
            </div>

            {/* Selection Indicator */}
            <div className="absolute top-6 right-6">
              <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                selectedPlan === 'annual' 
                  ? 'border-white bg-white' 
                  : 'border-gray-300 bg-white'
              }`}>
                {selectedPlan === 'annual' && (
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2">{plans.annual.name}</h3>
            <div className="mb-2">
              <span className="text-4xl font-bold">R{plans.annual.price}</span>
              <span className={selectedPlan === 'annual' ? 'text-blue-100' : 'text-gray-500'}>
                /{plans.annual.duration}
              </span>
            </div>
            <p className={`text-sm font-semibold mb-6 ${
              selectedPlan === 'annual' ? 'text-yellow-300' : 'text-orange-600'
            }`}>
              {plans.annual.savings}
            </p>

            <ul className="space-y-3 mb-8">
              {plans.annual.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className={`w-6 h-6 mr-3 flex-shrink-0 ${
                    selectedPlan === 'annual' ? 'text-blue-200' : 'text-blue-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subscribe Button */}
        <div className="text-center">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading || !selectedPlan}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Subscribe Now - R${plans[selectedPlan].price}`
            )}
          </button>

          <p className="mt-6 text-gray-600">
            Selected: <span className="font-semibold text-blue-600">{plans[selectedPlan].name}</span>
          </p>

          <p className="mt-4 text-sm text-gray-500">
            Secure payment powered by PayFast
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/gpa')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            ← Back to GPA Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;