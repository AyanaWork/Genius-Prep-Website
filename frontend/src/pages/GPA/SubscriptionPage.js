import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gpaService from '../../services/gpa';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  // UPDATED PRICING - Daily: R100, Monthly: R250, Semester: R450
  const plans = {
    TRIAL: {
      name: 'Free Trial',
      price: 0,
      queries: 5,
      duration: 'trial',
      features: [
        '5 AI queries total',
        'Basic study assistance',
        'Limited features',
        'Perfect for trying out GPA AI'
      ]
    },
    DAILY: {
      name: 'Daily Pass',
      price: 100,
      queries: -1, // Unlimited
      duration: 'day',
      features: [
        '24-hour access',
        'Unlimited queries',
        'All AI features',
        'Study notes generation',
        'Practice questions',
        'Instant summaries'
      ]
    },
    MONTHLY: {
      name: 'Monthly Plan',
      price: 250,
      queries: -1, // Unlimited
      duration: 'month',
      features: [
        '30-day access',
        'Unlimited queries',
        'All AI features',
        'Study notes generation',
        'Practice questions',
        'Conversation history',
        'Priority support',
        'Best value for students'
      ]
    },
    SEMESTER: {
      name: 'Semester Plan',
      price: 450,
      queries: -1, // Unlimited
      duration: 'semester',
      features: [
        '6-month access',
        'Unlimited queries',
        'All AI features',
        'Study notes generation',
        'Practice questions',
        'Conversation history',
        'Priority support',
        'Exam preparation tools',
        'Best long-term value!'
      ]
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await gpaService.checkSubscription();
      if (response.subscription) {
        setCurrentPlan(response.subscription.subscription_type);
      }
    } catch (error) {
      console.error('Check subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    // Free trial - just activate
    if (planType === 'TRIAL') {
      try {
        setProcessingPlan(planType);
        await gpaService.activateSubscription(planType);
        alert('Trial activated! You now have 5 free queries.');
        navigate('/gpa');
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to activate trial');
      } finally {
        setProcessingPlan(null);
      }
      return;
    }

    // Paid plans - redirect to payment
    try {
      setProcessingPlan(planType);
      const response = await gpaService.createSubscriptionPayment(planType);
      
      if (response.payment && response.payment.url) {
        // Create a form and submit to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = response.payment.url;

        // Add all payment data as hidden fields
        Object.keys(response.payment.data).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = response.payment.data[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.response?.data?.error || 'Failed to process subscription');
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="mt-4 text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your GPA AI Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the power of AI to accelerate your learning. Get instant notes, practice tests, and personalized study plans.
          </p>
          {currentPlan && (
            <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              Current Plan: <strong>{currentPlan}</strong>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {Object.entries(plans).map(([planType, plan]) => {
            const isCurrentPlan = currentPlan === planType;
            const isPopular = planType === 'MONTHLY'; // Monthly is most popular
            const isBestValue = planType === 'SEMESTER'; // Semester is best value
            
            return (
              <div
                key={planType}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isPopular || isBestValue ? 'border-4 border-blue-500' : 'border border-gray-200'
                }`}
              >
                {/* Popular/Best Value Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}
                {isBestValue && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    BEST VALUE
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-bold rounded-br-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">
                        Free
                      </div>
                    ) : (
                      <>
                        <div className="flex items-baseline">
                          <span className="text-4xl font-bold text-gray-900">
                            R{plan.price}
                          </span>
                          <span className="text-gray-600 ml-2">
                            /{plan.duration === 'day' ? 'day' : plan.duration === 'month' ? 'month' : 'semester'}
                          </span>
                        </div>
                        {plan.duration === 'semester' && (
                          <p className="text-sm text-green-600 mt-1 font-semibold">
                            Save R1050 vs monthly!
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Queries */}
                  <div className="mb-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.queries === -1 ? '∞' : plan.queries}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {plan.queries === -1 ? 'Unlimited queries' : `${plan.queries} queries total`}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(planType)}
                    disabled={isCurrentPlan || processingPlan === planType}
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                      isCurrentPlan
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isPopular || isBestValue
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {processingPlan === planType ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : plan.price === 0 ? (
                      'Start Free Trial'
                    ) : (
                      `Subscribe for R${plan.price}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Comparison */}
        <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            💰 Price Comparison
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-gray-600 mb-2">Daily Pass</p>
              <p className="text-3xl font-bold text-gray-900">R100</p>
              <p className="text-sm text-gray-500 mt-1">per day</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <p className="text-gray-600 mb-2">Monthly Plan</p>
              <p className="text-3xl font-bold text-blue-600">R250</p>
              <p className="text-sm text-gray-500 mt-1">per month</p>
              <p className="text-xs text-green-600 font-semibold mt-2">Save R50/month!</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300">
              <p className="text-gray-600 mb-2">Semester Plan</p>
              <p className="text-3xl font-bold text-green-600">R450</p>
              <p className="text-sm text-gray-500 mt-1">for 6 months</p>
              <p className="text-xs text-green-700 font-bold mt-2">Save R1050 total!</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">How does billing work?</h3>
              <p className="text-gray-600">
                Daily plans give you 24-hour access. Monthly plans renew every 30 days. Semester plans give you 6 months of access with one payment.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-600">
                Yes! You can purchase any plan at any time. If upgrading from a shorter to longer plan, you'll get the best value.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and instant EFT through PayFast, a secure South African payment gateway.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! Everyone starts with a free trial that includes 5 AI queries. No credit card required to start.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Which plan should I choose?</h3>
              <p className="text-gray-600">
                <strong>Daily Pass (R100):</strong> Perfect for quick exam prep or last-minute studying.<br/>
                <strong>Monthly Plan (R250):</strong> Best for regular students who need ongoing help.<br/>
                <strong>Semester Plan (R450):</strong> Best value for serious students planning ahead - save R1050!
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Instant Access</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/gpa')}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center mx-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to GPA Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;