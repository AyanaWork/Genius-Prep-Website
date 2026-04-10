import React, { useState } from 'react';
import paymentService from '../../services/payment';

function SubscriptionPage({ onBack }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    annual: {
      name: 'Annual Subscription',
      price: 700,
      duration: '12 months',
      savings: 'Save R200 per year',
      features: [
        'Unlimited note generation',
        'Unlimited test creation',
        'PDF analysis',
        'Academic Q&A',
        'Priority support',
        'Early access to new features'
      ]
    },
    semester: {
      name: 'Semester Subscription',
      price: 450,
      duration: '6 months',
      savings: 'Perfect for students',
      features: [
        'Unlimited note generation',
        'Unlimited test creation',
        'PDF analysis',
        'Academic Q&A',
        'Email support'
      ]
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError('');

      // Generate payment data from backend
      const result = await paymentService.initiatePayment(selectedPlan);

      // Redirect to PayFast
      paymentService.submitPayFastForm(result.paymentData, result.paymentUrl);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Subscribe to GPA 🤖
        </h1>
        <p className="text-xl text-gray-600">
          Unlock unlimited AI-powered study tools and accelerate your academic success
        </p>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Annual Plan */}
        <div
          onClick={() => setSelectedPlan('annual')}
          className={`relative cursor-pointer rounded-2xl p-8 border-2 transition ${
            selectedPlan === 'annual'
              ? 'border-primary-600 bg-primary-50 shadow-xl'
              : 'border-gray-200 bg-[#0f172a] hover:border-primary-300'
          }`}
        >
          {selectedPlan === 'annual' && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-primary-600 text-white rounded-full text-sm font-bold">
              BEST VALUE
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{plans.annual.name}</h3>
              <p className="text-green-600 font-semibold">{plans.annual.savings}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">R{plans.annual.price}</div>
              <div className="text-sm text-gray-600">{plans.annual.duration}</div>
            </div>
          </div>

          <ul className="space-y-3">
            {plans.annual.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Semester Plan */}
        <div
          onClick={() => setSelectedPlan('semester')}
          className={`cursor-pointer rounded-2xl p-8 border-2 transition ${
            selectedPlan === 'semester'
              ? 'border-primary-600 bg-primary-50 shadow-xl'
              : 'border-gray-200 bg-[#0f172a] hover:border-primary-300'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{plans.semester.name}</h3>
              <p className="text-blue-600 font-semibold">{plans.semester.savings}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary-600">R{plans.semester.price}</div>
              <div className="text-sm text-gray-600">{plans.semester.duration}</div>
            </div>
          </div>

          <ul className="space-y-3">
            {plans.semester.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subscribe Button */}
      <div className="text-center">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="inline-flex items-center px-12 py-4 bg-primary-600 text-white rounded-lg text-lg font-bold hover:bg-primary-700 transition shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            `Subscribe to ${selectedPlan === 'annual' ? 'Annual' : 'Semester'} Plan - R${plans[selectedPlan].price}`
          )}
        </button>

        <p className="mt-4 text-sm text-gray-600">
          Secure payment powered by PayFast
        </p>

        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 text-gray-600 hover:text-gray-900 transition"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* FAQs */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">Yes, you can cancel your subscription at any time. Your access continues until the end of your paid period.</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Is payment secure?</h3>
            <p className="text-gray-600">Absolutely. All payments are processed securely through PayFast, South Africa's leading payment gateway.</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2">What if I need help?</h3>
            <p className="text-gray-600">Contact us at hello@geniuspreptuition.co.za and we'll assist you within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;