import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment';
import authService from '../../services/auth';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    daily: {
      name: 'Daily Access',
      price: 100,
      duration: '1 day',
      subscriptionType: 'daily',
      badge: null,
      badgeColor: null,
      description: 'Perfect for exam day or a single study session',
      features: [
        'Full GPA AI access for 24 hours',
        'Generate notes, tests & memos',
        'PDF document analysis',
        'Academic Q&A support',
        'All subjects & languages',
      ]
    },
    monthly: {
      name: 'Monthly Access',
      price: 250,
      duration: '1 month',
      subscriptionType: 'monthly',
      badge: 'POPULAR',
      badgeColor: 'from-blue-500 to-blue-600',
      description: 'Great for ongoing study support',
      features: [
        'Full GPA AI access for 30 days',
        'Generate notes, tests & memos',
        'PDF document analysis',
        'Academic Q&A support',
        'All subjects & languages',
        'Priority support',
      ]
    },
    semester: {
      name: 'Semester Access',
      price: 450,
      duration: '6 months',
      subscriptionType: 'semester',
      badge: null,
      badgeColor: null,
      description: 'Ideal for a full academic semester',
      features: [
        'Full GPA AI access for 6 months',
        'Generate notes, tests & memos',
        'PDF document analysis',
        'Academic Q&A support',
        'All subjects & languages',
        'Priority support',
        'Save vs monthly plan',
      ]
    },
    annual: {
      name: 'Annual Access',
      price: 700,
      duration: '12 months',
      subscriptionType: 'annual',
      badge: 'BEST VALUE',
      badgeColor: 'from-yellow-400 to-orange-500',
      description: 'Best value — full year of academic support',
      features: [
        'Full GPA AI access for 12 months',
        'Generate notes, tests & memos',
        'PDF document analysis',
        'Academic Q&A support',
        'All subjects & languages',
        'Priority support',
        'Early access to new features',
        'Save R500 vs monthly plan',
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

      // Use the subscriptionType value from the selected plan
      const response = await paymentService.initiatePayment(plans[selectedPlan].subscriptionType);

      console.log('Payment response:', response);

      if (!response.success || !response.paymentData || !response.paymentUrl) {
        throw new Error('Invalid payment response from server');
      }

      // Create form and submit to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = response.paymentUrl;

      Object.keys(response.paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = response.paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
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
            Subscribe to GPA 🚀
          </h1>
          <p className="text-xl text-gray-600">
            Unlock unlimited AI-powered study tools — choose the plan that suits you
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Pricing Cards — 4 plans in a responsive grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                selectedPlan === key
                  ? 'bg-blue-600 text-white shadow-2xl scale-105 ring-4 ring-blue-400'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`bg-gradient-to-r ${plan.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Selection indicator */}
              <div className="absolute top-4 right-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === key ? 'border-white bg-white' : 'border-gray-300 bg-white'
                }`}>
                  {selectedPlan === key && (
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  )}
                </div>
              </div>

              {/* Plan name & price */}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className={`text-xs mb-4 ${selectedPlan === key ? 'text-blue-100' : 'text-gray-500'}`}>
                {plan.description}
              </p>
              <div className="mb-4">
                <span className="text-3xl font-black">R{plan.price}</span>
                <span className={`text-sm ml-1 ${selectedPlan === key ? 'text-blue-100' : 'text-gray-500'}`}>
                  / {plan.duration}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <svg
                      className={`w-4 h-4 mr-2 flex-shrink-0 mt-0.5 ${
                        selectedPlan === key ? 'text-blue-200' : 'text-blue-600'
                      }`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Subscribe Button */}
        <div className="text-center">
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
              `Subscribe Now — R${plans[selectedPlan].price} / ${plans[selectedPlan].duration}`
            )}
          </button>

          <p className="mt-3 text-gray-600">
            Selected: <span className="font-semibold text-blue-600">{plans[selectedPlan].name}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            🔒 Secure payment powered by PayFast
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

        {/* FAQs */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What's the difference between plans?</h3>
              <p className="text-gray-600">All plans give you full GPA access — the only difference is duration. Daily is great for exam prep, monthly for ongoing use, semester and annual for the best value.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Can I cancel anytime?</h3>
              <p className="text-gray-600">Yes. Your access continues until the end of your paid period. See our Refund Policy for details.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Is payment secure?</h3>
              <p className="text-gray-600">Absolutely. All payments are processed securely through PayFast, South Africa's leading payment gateway. We never store your card details.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Need help?</h3>
              <p className="text-gray-600">Contact us at <a href="mailto:hello@geniuspreptuition.co.za" className="text-blue-600 hover:underline">hello@geniuspreptuition.co.za</a> and we'll respond within 24 hours.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SubscriptionPage;