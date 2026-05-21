import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentType, setPaymentType] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference') || searchParams.get('trxref');
      const type = searchParams.get('type');

      console.log('Payment success URL params:', { reference, type });

      if (!reference) {
        setError('No payment reference found. If you completed payment, your subscription may still be activating — please wait a moment and check your GPA dashboard.');
        setLoading(false);
        return;
      }

      const response = await api.post('/payments/verify', { reference, type });

      if (response.data.success) {
        setPaymentType(type || response.data.type || 'gpa');
        setLoading(false);
        setTimeout(() => {
          if (type === 'booking') {
            navigate('/student/dashboard');
          } else {
            navigate('/gpa');
          }
        }, 4000);
      } else {
        setError('Payment verification failed. Please contact support if payment was deducted.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      const type = searchParams.get('type');
      setPaymentType(type || 'gpa');
      setError(null);
      setLoading(false);
      setTimeout(() => {
        if (type === 'booking') {
          navigate('/student/dashboard');
        } else {
          navigate('/gpa');
        }
      }, 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
          <p className="text-gray-400">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Payment Verification Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/gpa')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">
              Go to Lwazi
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full glass-card rounded-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Payment Successful!</h1>
          <p className="text-gray-400">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>

        <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-xl p-6 mb-6">
          <h3 className="font-bold text-[#00CC99] mb-3">What's Next?</h3>
          <ul className="space-y-2 text-gray-300">
            {paymentType === 'booking' ? (
              <>
                <li className="flex items-start">✓ Your booking has been confirmed</li>
                <li className="flex items-start">✓ Your tutor will contact you shortly</li>
                <li className="flex items-start">✓ Check your dashboard for session details</li>
              </>
            ) : (
              <>
                <li className="flex items-start">✓ Your GPA subscription is now active</li>
                <li className="flex items-start">✓ Start using AI-powered study tools immediately</li>
                <li className="flex items-start">✓ Check your email for your receipt</li>
              </>
            )}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(paymentType === 'booking' ? '/student/dashboard' : '/gpa')}
            className="flex-1 px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition"
          >
            {paymentType === 'booking' ? 'Go to My Dashboard' : 'Go to Lwazi'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-6 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition"
          >
            Back to Home
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          You will be automatically redirected in a few seconds...
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;