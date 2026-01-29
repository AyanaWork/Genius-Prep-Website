import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import paymentService from '../../services/payment';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState({});
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/payments/plans');
      setPlans(response.data.plans);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/gpa/subscription');
      setCurrentPlan(response.data.subscription?.subscription_type || 'FREE');
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      setProcessingPlan(planType);

      // Free plan doesn't need payment
      if (planType === 'FREE') {
        const response = await api.post('/payments/gpa/initiate', {
          subscriptionType: 'FREE'
        });
        alert('Free subscription activated!');
        navigate('/gpa');
        return;
      }

      // Initiate payment
      const response = await paymentService.initiatePayment(planType);
      
      if (response.success) {
        // Submit to PayFast
        paymentService.submitToPayFast(response.paymentUrl, response.paymentData);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to process subscription. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
            const isPremium = planType === 'UNLIMITED';
            
            return (
              <div
                key={planType}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  isPremium ? 'border-4 border-blue-500' : 'border border-gray-200'
                }`}
              >
                {/* Premium Badge */}
                {isPremium && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                    MOST POPULAR
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
                          <span className="text-gray-600 ml-2">/month</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Queries */}
                  <div className="mb-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {plan.queries === -1 ? '∞' : plan.queries}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {plan.queries === -1 ? 'Unlimited queries' : 'Queries per month'}
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
                        : isPremium
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
                    ) : (
                      `Subscribe Now`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
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
                All plans are billed monthly. You can cancel anytime and your subscription will remain active until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-900 mb-2">Can I upgrade or downgrade?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the difference.
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
              <span>Cancel Anytime</span>
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