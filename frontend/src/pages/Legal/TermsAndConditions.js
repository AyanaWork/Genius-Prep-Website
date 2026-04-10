import React from 'react';
import { useNavigate } from 'react-router-dom';

function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1a2332] py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/pricing-legal')}
            className="text-[#4A90E2] hover:text-white transition mb-4 flex items-center gap-2"
          >
            ← Back to Pricing & Legal
          </button>
          <h1 className="text-4xl font-bold text-white">Terms and Conditions</h1>
          <p className="text-gray-400 mt-2">Genius Prep Tuition (PTY) LTD | Last updated: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-[#0f172a] rounded-xl shadow-sm p-8 space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Genius Prep Tuition (PTY) LTD. By accessing or using our platform at geniuspreptuition.co.za,
              you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
              If you do not agree to these terms, you may not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">2. Services Offered</h2>
            <p className="text-gray-700 leading-relaxed mb-3">Genius Prep Tuition provides the following services:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>One-on-one and group academic tutoring (online and in-person)</li>
              <li>Home-school support for NSC, IEB, Cambridge, IB, A-levels, and AP curricula</li>
              <li>Relocation tutoring for learners transitioning between curricula</li>
              <li>Exam preparation for NBT, SAT, Cambridge, and university entrance exams</li>
              <li>Academic and life coaching</li>
              <li>Upskilling courses in AI, machine learning, Microsoft Office, coding, and automation</li>
              <li>Access to the Genius Prep Accelerator (GPA); an AI-powered academic tool</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To access certain features, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your password and account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be solely responsible for all activities that occur under your account</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">4. Booking and Payment Terms</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>All bookings are subject to tutor availability and acceptance</li>
              <li>The minimum booking duration is 3 hours per session</li>
              <li>Full payment is required before a session is confirmed</li>
              <li>All prices are listed in South African Rand (ZAR) and include VAT where applicable</li>
              <li>Payments are processed securely through Paystack</li>
              <li>GPA subscriptions are available at R100 per day, R250 per month, R450 per semester, or R700 per year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">5. Tutor Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Tutors must provide accurate qualifications and experience information</li>
              <li>Tutors are responsible for delivering sessions on time and professionally</li>
              <li>Tutors must notify students and the platform at least 24 hours in advance of any cancellation</li>
              <li>Tutors are independent contractors and not employees of Genius Prep Tuition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">6. Student Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Students must attend booked sessions punctually</li>
              <li>Cancellations must be made at least 24 hours before the session</li>
              <li>Students must treat tutors with respect and professionalism</li>
              <li>Students under 18 must have parental or guardian consent to use the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this platform, including but not limited to text, graphics, logos, images, GPA-generated content,
              and software, is the property of Genius Prep Tuition (PTY) LTD and is protected by South African and
              international copyright laws. You may not reproduce, distribute, or use our content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Genius Prep Tuition shall not be liable for any indirect, incidental, or consequential damages arising
              from your use of the platform or services. Our total liability to any user shall not exceed the amount
              paid by that user in the 30 days preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">9. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by the laws of the Republic of South Africa.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of Gauteng, South Africa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">10. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions about these Terms, please contact us at:<br />
              Email: <a href="mailto:hello@geniuspreptuition.co.za" className="text-[#4A90E2]">hello@geniuspreptuition.co.za</a><br />
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