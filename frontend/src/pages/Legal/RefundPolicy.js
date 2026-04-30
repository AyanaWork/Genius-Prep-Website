import React from 'react';
import { useNavigate } from 'react-router-dom';

function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-[#0a101f] border-b border-white/10 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/pricing-legal')}
            className="text-[#00CC99] hover:text-white transition mb-4 flex items-center gap-2"
          >
            ← Back to Pricing & Legal
          </button>
          <h1 className="text-4xl font-black">Refund Policy</h1>
          <p className="text-gray-400 mt-2">Genius Accelerator | Last updated: January 2026 | CPA Compliant</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="glass-card rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              At Genius Accelerator, we are committed to ensuring customer satisfaction.
              We understand that circumstances change, and this policy outlines when and how refunds are issued
              for our services. All refund requests are handled in accordance with the Consumer Protection Act 68 of 2008 (CPA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Tutoring Session Refunds</h2>
            <h3 className="text-lg font-semibold mb-2">Student Cancellations:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-4">
              <li><strong>Cancellation 24 or more hours before the session:</strong> Full refund issued within 5 to 7 business days</li>
              <li><strong>Cancellation less than 24 hours before the session:</strong> 50% refund</li>
              <li><strong>No-show (student does not attend without notice):</strong> No refund</li>
            </ul>
            <h3 className="text-lg font-semibold mb-2">Tutor Cancellations:</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>If a tutor cancels at any time, the student receives a <strong>full refund</strong></li>
              <li>The student also has the option to rebook with the same or a different tutor</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Lwazi Subscription Refunds</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Within 7 days of purchase:</strong> Full refund if the Lwazi has not been used</li>
              <li><strong>After 7 days:</strong> No refund for used subscriptions</li>
              <li><strong>Technical issues:</strong> If GPA is inaccessible for more than 72 consecutive hours due to our fault, a pro-rata refund or subscription extension will be offered</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. How to Request a Refund</h2>
            <p className="text-gray-300 leading-relaxed mb-3">To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-6 text-gray-300 space-y-2">
              <li>Email us at <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99]">admin@geniusaccelerator.co.za</a></li>
              <li>Include your full name, booking or payment reference number, and reason for the refund</li>
              <li>We will acknowledge your request within 1 business day</li>
              <li>Refunds are processed back to the original payment method within 5 to 7 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Non-Refundable Items</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Sessions that have already been completed</li>
              <li>Lwazi subscriptions where the service has been used</li>
              <li>Administrative or processing fees</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Payment Method</h2>
            <p className="text-gray-300 leading-relaxed">
              All refunds will be returned to the original payment method used at the time of purchase,
              processed through Paystack. Genius Accelerator does not hold or manage card details;
              these are handled securely by Paystack.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For refund queries, please contact us at:<br />
              Email: <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99]">admin@geniusaccelerator.co.za</a><br />
              Phone: 071 961 7185<br />
              Response time: Within 1 business day
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RefundPolicy;