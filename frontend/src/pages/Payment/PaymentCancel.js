import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#0f172a] rounded-2xl shadow-2xl p-8 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges were made to your account.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If you experienced any issues during checkout, please try again or contact our support team for assistance.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Need help?</p>
          <a 
            href="mailto:hello@geniuspreptuition.co.za"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;