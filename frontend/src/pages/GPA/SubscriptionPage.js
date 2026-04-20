import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../../services/payment';
import authService from '../../services/auth';
import companyLogo from '../../assets/logos/GA_1.jpeg';
import Navbar from '../../components/common/NavBar';

function SubscriptionPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentUser = authService.getCurrentUser();

  const plans = {
    daily: {
      name: 'Daily Access',
      price: 100,
      duration: '1 day',
      subscriptionType: 'daily',
      badge: null,
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
      badgeColor: 'from-[#00CC99] to-emerald-500',
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
      badgeColor: 'from-yellow-500 to-orange-500',
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
      const response = await paymentService.initiatePayment(plans[selectedPlan].subscriptionType);
      if (response && response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar - same as student dashboard */}
        <Navbar />

      {/* Main Content */}
      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
            Subscribe to GPA 🚀
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Unlock unlimited AI-powered study tools — choose the plan that suits you
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-xl max-w-2xl mx-auto">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                selectedPlan === key
                  ? 'glass-card border-[#00CC99] bg-[#00CC99]/10 scale-105 ring-2 ring-[#00CC99]'
                  : 'glass-card hover:border-[#00CC99]/40 hover:scale-105'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`bg-gradient-to-r ${plan.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === key ? 'border-[#00CC99] bg-[#00CC99]' : 'border-white/30 bg-transparent'
                }`}>
                  {selectedPlan === key && <div className="w-3 h-3 rounded-full bg-[#0f172a]"></div>}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-black text-[#00CC99]">R{plan.price}</span>
                <span className="text-sm text-gray-400 ml-1">/ {plan.duration}</span>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-300">
                    <svg className="w-4 h-4 mr-2 text-[#00CC99] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="px-12 py-4 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              `Subscribe Now — R${plans[selectedPlan].price} / ${plans[selectedPlan].duration}`
            )}
          </button>
          <p className="mt-3 text-gray-400">
            Selected: <span className="font-semibold text-[#00CC99]">{plans[selectedPlan].name}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">🔒 Secure payment powered by Paystack</p>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <button onClick={() => navigate('/gpa')} className="text-gray-400 hover:text-white transition">
            ← Back to GPA Dashboard
          </button>
        </div>

        {/* FAQs */}
        <div className="mt-16 glass-card rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-[#00CC99] mb-1">What's the difference between plans?</h3>
              <p className="text-gray-400 text-sm">All plans give you full GPA access — the only difference is duration. Daily is great for exam prep, monthly for ongoing use, semester and annual for the best value.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#00CC99] mb-1">Can I cancel anytime?</h3>
              <p className="text-gray-400 text-sm">Yes. Your access continues until the end of your paid period. See our Refund Policy for details.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#00CC99] mb-1">Is payment secure?</h3>
              <p className="text-gray-400 text-sm">Absolutely. All payments are processed securely through Paystack. We never store your card details.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#00CC99] mb-1">Need help?</h3>
              <p className="text-gray-400 text-sm">Contact us at <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99] hover:underline">admin@geniusaccelerator.co.za</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;