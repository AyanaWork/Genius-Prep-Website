import React from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';

function PaymentCancel() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h2>
        <p className="text-gray-300 mb-6">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-6 text-left rounded-r-lg">
          <p className="text-sm text-yellow-300">
            <strong>Note:</strong> If you experienced any issues during checkout, please try again or contact our support team for assistance.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition"
          >
            Back to Home
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400 mb-2">Need help?</p>
          <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99] hover:text-white transition text-sm">
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;