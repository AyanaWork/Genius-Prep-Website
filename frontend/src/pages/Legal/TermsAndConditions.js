import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using the Genius Prep Tuition platform ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use the Platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Genius Prep Tuition provides online educational services including but not limited to:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>One-on-one and group tutoring sessions (online and in-person)</li>
            <li>AI-powered study assistance through Genius Prep Accelerator (GPA)</li>
            <li>Access to educational resources, notes, and practice materials</li>
            <li>Tutor matching and booking services</li>
            <li>Home-school support and exam preparation</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            <strong>3.1 Registration:</strong> To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during registration.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>3.3 Account Types:</strong> The Platform offers Student and Tutor accounts, each with different rights and responsibilities.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">4. GPA (Genius Prep Accelerator) Subscription</h2>
          <p className="text-gray-700 mb-4">
            <strong>4.1 Free Tier:</strong> New users receive 5 free AI generations to trial the GPA service.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>4.2 Paid Subscriptions:</strong> After the free tier is exhausted, users must subscribe to continue using GPA. Available subscription plans are:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>6-Month (Semester) Plan: R450</li>
            <li>Annual Plan: R700</li>
          </ul>
          <p className="text-gray-700 mb-4">
            <strong>4.3 Auto-Renewal:</strong> Subscriptions do not auto-renew. Users must manually renew their subscription upon expiry.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>4.4 Usage:</strong> GPA may not be used for any unlawful or prohibited activities, including but not limited to academic dishonesty or cheating.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">5. Tutoring Services</h2>
          <p className="text-gray-700 mb-4">
            <strong>5.1 Booking:</strong> Students can request tutoring sessions through the Platform. Tutors have the right to accept or decline booking requests.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>5.2 Payment:</strong> Payment for tutoring services is required at the time of booking. Minimum booking is 3 hours.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>5.3 Cancellation:</strong> Cancellation policies vary by tutor. Please review the specific tutor's policies before booking.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>5.4 Tutor Verification:</strong> While we strive to verify all tutors through document checks and approval processes, Genius Prep Tuition acts as a platform and is not responsible for the quality or conduct of individual tutors.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">6. Payments and Refunds</h2>
          <p className="text-gray-700 mb-4">
            <strong>6.1 Payment Processing:</strong> All payments are processed securely through PayFast, our payment gateway partner.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>6.2 Pricing:</strong> All prices are listed in South African Rand (ZAR) and include VAT where applicable.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>6.3 Refunds:</strong> Please refer to our separate Refund Policy for detailed information about refunds and cancellations.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            <strong>7.1 Platform Content:</strong> All content on the Platform, including text, graphics, logos, and software, is the property of Genius Prep Tuition and is protected by intellectual property laws.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>7.2 User Content:</strong> Users retain ownership of content they upload but grant Genius Prep Tuition a license to use such content for the operation of the Platform.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>7.3 AI-Generated Content:</strong> Content generated by GPA is provided for educational purposes only. Users are granted a personal, non-exclusive license to use this content for their studies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">8. User Conduct</h2>
          <p className="text-gray-700 mb-4">Users agree not to:</p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Upload or transmit viruses or malicious code</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use the Platform for commercial purposes without authorization</li>
            <li>Attempt to gain unauthorized access to any part of the Platform</li>
            <li>Use GPA to complete assignments or exams in violation of academic integrity policies</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">9. Privacy and Data Protection</h2>
          <p className="text-gray-700 mb-4">
            Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using the Platform, you consent to such processing.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">10. Disclaimers</h2>
          <p className="text-gray-700 mb-4">
            <strong>10.1 No Guarantee of Results:</strong> While we strive to provide high-quality educational services, we cannot guarantee specific academic outcomes or results.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>10.2 AI Limitations:</strong> GPA is an AI tool and may occasionally produce inaccurate or incomplete information. Users should verify important information independently.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>10.3 Platform Availability:</strong> We do not guarantee uninterrupted or error-free operation of the Platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">11. Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            To the fullest extent permitted by law, Genius Prep Tuition shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Platform.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">12. Termination</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">13. Changes to Terms</h2>
          <p className="text-gray-700 mb-4">
            We reserve the right to modify these Terms and Conditions at any time. We will notify users of significant changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the updated terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">14. Governing Law</h2>
          <p className="text-gray-700 mb-4">
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">15. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            For questions about these Terms and Conditions, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700"><strong>Email:</strong> hello@geniuspreptuition.co.za</p>
            <p className="text-gray-700"><strong>Phone:</strong> 071 961 7185</p>
            <p className="text-gray-700"><strong>Address:</strong> City of Tshwane, Gauteng, South Africa</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-600">
              By using Genius Prep Tuition, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
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

export default TermsAndConditions;