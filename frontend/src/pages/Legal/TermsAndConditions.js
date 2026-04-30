import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
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
          <h1 className="text-4xl md:text-5xl font-black text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Terms and Conditions</h1>
          <p className="text-gray-400 mt-2">Genius Accelerator | Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="glass-card rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Genius Accelerator. By accessing or using our platform at geniusaccelerator.co.za,
              you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
              If you do not agree to these terms, you may not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Services Offered</h2>
            <p className="text-gray-300 leading-relaxed mb-3">Genius Accelerator provides the following services:</p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>One-on-one and group academic tutoring (online and in-person)</li>
              <li>Home-school support for NSC, IEB, Cambridge, IB, A-levels, and AP curricula</li>
              <li>Relocation tutoring for learners transitioning between curricula</li>
              <li>Exam preparation for NBT, SAT, Cambridge, and university entrance exams</li>
              <li>Academic and life coaching</li>
              <li>Upskilling courses in AI, machine learning, Microsoft Office, coding, and automation</li>
              <li>Access to the Genius Accelerator (GPA); an AI-powered academic tool</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be solely responsible for all activities that occur under your account</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Booking and Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>All bookings are subject to tutor availability and acceptance</li>
              <li>The minimum booking duration is 3 hours per session</li>
              <li>Full payment is required before a session is confirmed</li>
              <li>All prices are listed in South African Rand (ZAR) and include VAT where applicable</li>
              <li>Payments are processed securely through Paystack</li>
              <li>Lwazi subscriptions are available at R100 per day, R250 per month, R450 per semester, or R700 per year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Tutor Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Tutors must provide accurate qualifications and experience information</li>
              <li>Tutors are responsible for delivering sessions on time and professionally</li>
              <li>Tutors must notify students and the platform at least 24 hours in advance of any cancellation</li>
              <li>Tutors are independent contractors and not employees of Genius Accelerator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Student Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Students must attend booked sessions punctually</li>
              <li>Cancellations must be made at least 24 hours before the session</li>
              <li>Students must treat tutors with respect and professionalism</li>
              <li>Students under 18 must have parental or guardian consent to use the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              All content on this platform, including but not limited to text, graphics, logos, images, GPA-generated content,
              and software, is the property of Genius Accelerator and is protected by South African and
              international copyright laws. You may not reproduce, distribute, or use our content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              Genius Accelerator shall not be liable for any indirect, incidental, or consequential damages arising
              from your use of the platform or services. Our total liability to any user shall not exceed the amount
              paid by that user in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms and Conditions are governed by the laws of the Republic of South Africa.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of Gauteng, South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For any questions about these Terms, please contact us at:<br />
              Email: <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99]">admin@geniusaccelerator.co.za</a><br />
              Phone: 071 961 7185<br />
              Location: City of Tshwane, Gauteng, South Africa
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;