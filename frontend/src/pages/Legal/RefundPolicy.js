import React from 'react';
import { useNavigate } from 'react-router-dom';

function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Refund Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">1. Overview</h2>
          <p className="text-gray-700 mb-4">
            At Genius Prep Tuition, we are committed to providing high-quality educational services. This Refund Policy outlines the circumstances under which refunds may be issued for our services.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Important:</strong> All refund requests are subject to review and approval. We reserve the right to refuse refunds that do not meet the criteria outlined in this policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">2. GPA (Genius Prep Accelerator) Subscriptions</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.1 7-Day Money-Back Guarantee</h3>
          <p className="text-gray-700 mb-4">
            We offer a <strong>7-day money-back guarantee</strong> for all new GPA subscriptions (both 6-Month and Annual plans).
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
            <p className="text-gray-800 font-semibold mb-2">Eligibility Requirements:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Request must be made within 7 calendar days of purchase</li>
              <li>Applies only to first-time GPA subscribers</li>
              <li>You have used less than 20% of the service features</li>
              <li>No previous refund requests on the account</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.2 How to Request a GPA Refund</h3>
          <p className="text-gray-700 mb-4">
            To request a refund within the 7-day period:
          </p>
          <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">
            <li>Email us at <strong>hello@geniuspreptuition.co.za</strong></li>
            <li>Include your account email and subscription order number</li>
            <li>Provide a brief reason for the refund request</li>
            <li>Allow 3-5 business days for processing</li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.3 Refund Processing</h3>
          <p className="text-gray-700 mb-4">
            <strong>Approved refunds will be:</strong>
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Processed within 5-7 business days of approval</li>
            <li>Returned via the original payment method</li>
            <li>Reflected in your account within 7-10 business days (depending on your bank)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.4 After the 7-Day Period</h3>
          <p className="text-gray-700 mb-4">
            After 7 days from purchase, GPA subscriptions are <strong>non-refundable</strong>. However, we may consider refunds in exceptional circumstances:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Technical issues preventing service usage (after attempted resolution)</li>
            <li>Duplicate charges or billing errors</li>
            <li>Serious platform malfunctions</li>
          </ul>
          <p className="text-gray-700 mb-4">
            Such cases are evaluated individually and require supporting documentation.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">3. Tutoring Session Refunds</h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">3.1 Cancellation by Student</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-4">
            <p className="text-gray-800 font-semibold mb-2">Cancellation Windows:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>More than 24 hours before session:</strong> 100% refund</li>
              <li><strong>12-24 hours before session:</strong> 50% refund</li>
              <li><strong>Less than 12 hours before session:</strong> No refund</li>
              <li><strong>No-show:</strong> No refund</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">3.2 Cancellation by Tutor</h3>
          <p className="text-gray-700 mb-4">
            If a tutor cancels a session:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>At any time:</strong> Full (100%) refund to student</li>
            <li><strong>Alternative:</strong> Option to reschedule at no additional cost</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">3.3 Unsatisfactory Session Quality</h3>
          <p className="text-gray-700 mb-4">
            If you are dissatisfied with a tutoring session's quality:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Report the issue within 24 hours of the session</li>
            <li>Provide specific details about the concerns</li>
            <li>Our team will investigate and may offer:
              <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                <li>Partial or full refund</li>
                <li>Free session with a different tutor</li>
                <li>Platform credit for future use</li>
              </ul>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">4. Non-Refundable Items</h2>
          <p className="text-gray-700 mb-4">
            The following are <strong>not eligible for refunds</strong>:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Free trial GPA uses (5 free generations)</li>
            <li>Partial months of GPA subscriptions (prorated refunds not available)</li>
            <li>Completed tutoring sessions (unless quality issue reported within 24 hours)</li>
            <li>Digital materials or notes already accessed/downloaded</li>
            <li>Promotional or discounted subscriptions (unless within 7-day guarantee period)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">5. Payment Disputes and Chargebacks</h2>
          <p className="text-gray-700 mb-4">
            <strong>Before filing a chargeback</strong> with your bank, please contact us directly. Chargebacks can result in:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Account suspension pending resolution</li>
            <li>Loss of access to services</li>
            <li>Additional fees</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We are committed to resolving payment issues fairly and quickly. Most concerns can be addressed through direct communication.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">6. Technical Issues and Service Disruptions</h2>
          <p className="text-gray-700 mb-4">
            If you experience technical problems:
          </p>
          <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">
            <li>Contact support immediately at hello@geniuspreptuition.co.za</li>
            <li>Allow us to attempt to resolve the issue</li>
            <li>If the issue cannot be resolved within a reasonable timeframe, we may offer:
              <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                <li>Subscription extension</li>
                <li>Partial refund</li>
                <li>Platform credit</li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">7. Refund Exceptions</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to deny refunds in cases of:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Violation of our Terms and Conditions</li>
            <li>Abuse or misuse of the platform</li>
            <li>Fraudulent activity</li>
            <li>Excessive refund requests (pattern of abuse)</li>
            <li>Account suspension or termination for policy violations</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">8. Processing Time and Method</h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-800 font-semibold mb-2">Standard Refund Timeline:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Review:</strong> 1-3 business days</li>
              <li><strong>Processing:</strong> 3-5 business days after approval</li>
              <li><strong>Bank reflection:</strong> 5-10 business days</li>
            </ul>
            <p className="text-gray-700 mt-3">
              <strong>Refund Method:</strong> Original payment method used for purchase
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">9. Currency and Fees</h2>
          <p className="text-gray-700 mb-4">
            <strong>Refund Amount:</strong> Refunds are issued in South African Rand (ZAR), the currency of the original transaction.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Payment Gateway Fees:</strong> Non-refundable payment processing fees (charged by PayFast) may be deducted from the refund amount, typically 2-3% of the transaction.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">10. Contact Information for Refund Requests</h2>
          <p className="text-gray-700 mb-4">
            For refund requests or questions about this policy:
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700"><strong>Email:</strong> hello@geniuspreptuition.co.za</p>
            <p className="text-gray-700"><strong>Subject Line:</strong> "Refund Request - [Your Order Number]"</p>
            <p className="text-gray-700"><strong>Phone:</strong> 071 961 7185 (Monday-Friday, 9 AM - 5 PM SAST)</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">11. Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be communicated via email.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">12. Satisfaction Guarantee</h2>
          <p className="text-gray-700 mb-4">
            While we maintain this refund policy, our primary goal is your satisfaction. If you're unhappy with our services, please reach out. We're committed to finding a solution that works for you, whether that's a refund, service adjustment, or alternative arrangement.
          </p>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <p className="text-gray-800 font-semibold mb-2">📞 Need Help?</p>
              <p className="text-gray-700">
                If you have questions or concerns before purchasing, please contact us. We're here to ensure you make an informed decision about our services.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;