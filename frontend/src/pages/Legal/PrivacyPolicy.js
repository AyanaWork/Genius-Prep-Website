import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
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
          <h1 className="text-4xl font-black">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Genius Accelerator | Last updated: January 2026 | POPIA Compliant</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="glass-card rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              At Genius Accelerator, we take your privacy seriously. This policy explains how we collect,
              use, and protect your personal information in line with the Protection of Personal Information Act 4 of 2013 (POPIA).
              By using our platform, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-3">We may collect the following types of personal information:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Identity Information:</strong> Full name, date of birth, profile photograph</li>
              <li><strong>Contact Information:</strong> Email address, phone number, physical address</li>
              <li><strong>Academic Information:</strong> Qualifications, subjects, education level, institution</li>
              <li><strong>Payment Information:</strong> Processed securely by Paystack. We do not store full card details</li>
              <li><strong>Usage Data:</strong> Platform activity, session history, GPA chat interactions</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>To create and manage your account on the Platform</li>
              <li>To match students with suitable tutors</li>
              <li>To process bookings and payments</li>
              <li>To provide access to the GPA AI tool</li>
              <li>To send important notifications about your bookings and account</li>
              <li>To improve our services and platform experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Sharing of Information</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Tutors:</strong> Your name and booking details are shared with tutors you book</li>
              <li><strong>Paystack:</strong> Payment details are passed to Paystack for secure processing</li>
              <li><strong>Cloudinary:</strong> Profile images are stored via Cloudinary</li>
              <li><strong>OpenAI:</strong> GPA queries are processed via the OpenAI API; no personally identifiable information is shared</li>
              <li><strong>Legal authorities:</strong> If required by law or court order</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures including SSL encryption, hashed passwords,
              and secure payment processing. However, no transmission over the internet is 100% secure.
              You are responsible for keeping your account credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Your Rights Under POPIA</h2>
            <p className="text-gray-300 leading-relaxed mb-3">As a South African user, you have the right to:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to the processing of your information</li>
              <li>Lodge a complaint with the Information Regulator of South Africa</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Our Platform uses local storage and session tokens for authentication purposes. We do not
              currently use third-party tracking cookies. You can clear your browser storage at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Users under 18 years of age must have a parent or guardian's consent to use the Platform.
              We do not knowingly collect personal information from children without parental consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy-related requests or questions, please reach out to us at:<br />
              Email: <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99]">admin@geniusaccelerator.co.za</a><br />
              Phone: 071 961 7185<br />
              Information Officer: Genius Accelerator, City of Tshwane, Gauteng
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;