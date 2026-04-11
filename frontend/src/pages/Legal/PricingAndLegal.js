import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PricingAndLegal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pricing');

  const tabs = [
    { id: 'pricing', label: 'Pricing' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'refund', label: 'Refund Policy' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-[#0a101f] border-b border-white/10 py-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="text-[#00CC99] hover:text-white transition mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-black">Pricing & Legal</h1>
          <p className="text-gray-400 mt-2">Transparent pricing and policies for Genius Accelerator</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10 sticky top-0 z-10 bg-[#0f172a]/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-[#00CC99] text-[#00CC99]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* ==================== PRICING TAB ==================== */}
        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Our Pricing</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Transparent, flexible pricing for every student. No hidden fees.
              </p>
            </div>

            {/* GPA Subscription */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">
                GPA — Genius Prep Accelerator (AI Tool)
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {/* Daily Plan */}
                <div className="glass-card rounded-2xl p-6 flex flex-col hover:border-[#00CC99]/50 transition">
                  <h4 className="text-xl font-bold mb-1">Daily</h4>
                  <p className="text-gray-400 text-xs mb-4">Perfect for exam day or a single study session</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black text-[#00CC99]">R100</span>
                    <span className="text-gray-400 mb-1">/ 1 day</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      'Full GPA AI access for 24 hours',
                      'Generate notes, tests & memos',
                      'Upload & analyse PDF documents',
                      'Multilingual academic support',
                      'All subjects & faculties',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-[#00CC99] font-bold mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full py-3 glass-card rounded-lg font-semibold hover:border-[#00CC99]/50 transition"
                  >
                    Get Started
                  </button>
                </div>

                {/* Monthly Plan */}
                <div className="glass-card rounded-2xl border-2 border-[#00CC99]/30 p-6 flex flex-col relative hover:border-[#00CC99] transition">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00CC99] text-[#0f172a] px-4 py-1 rounded-full text-sm font-bold">
                    Popular
                  </div>
                  <h4 className="text-xl font-bold mb-1">Monthly</h4>
                  <p className="text-gray-400 text-xs mb-4">Great for ongoing study support</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black text-[#00CC99]">R250</span>
                    <span className="text-gray-400 mb-1">/ month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      'Full GPA AI access for 30 days',
                      'Generate notes, tests & memos',
                      'Upload & analyse PDF documents',
                      'Multilingual academic support',
                      'All subjects & faculties',
                      'Priority support',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-[#00CC99] font-bold mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold hover:scale-105 transition"
                  >
                    Get Started
                  </button>
                </div>

                {/* Semester Plan */}
                <div className="glass-card rounded-2xl p-6 flex flex-col hover:border-[#00CC99]/50 transition">
                  <h4 className="text-xl font-bold mb-1">Semester</h4>
                  <p className="text-gray-400 text-xs mb-4">Ideal for a full academic semester</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black text-[#00CC99]">R450</span>
                    <span className="text-gray-400 mb-1">/ 6 months</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      'Full GPA AI access for 6 months',
                      'Generate notes, tests & memos',
                      'Upload & analyse PDF documents',
                      'Multilingual academic support',
                      'All subjects & faculties',
                      'Priority support',
                      'Save vs monthly plan',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-[#00CC99] font-bold mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full py-3 glass-card rounded-lg font-semibold hover:border-[#00CC99]/50 transition"
                  >
                    Get Started
                  </button>
                </div>

                {/* Annual Plan */}
                <div className="glass-card rounded-2xl border-2 border-[#00CC99] p-6 flex flex-col relative bg-[#00CC99]/5 hover:scale-[1.02] transition">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00CC99] text-[#0f172a] px-4 py-1 rounded-full text-sm font-bold">
                    Best Value
                  </div>
                  <h4 className="text-xl font-bold mb-1">Annual</h4>
                  <p className="text-gray-400 text-xs mb-4">Best value — full year of academic support</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-4xl font-black text-[#00CC99]">R700</span>
                    <span className="text-gray-400 mb-1">/ year</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      'Full GPA AI access for 12 months',
                      'Generate notes, tests & memos',
                      'Upload & analyse PDF documents',
                      'Multilingual academic support',
                      'All subjects & faculties',
                      'Priority support',
                      'Early access to new features',
                      'Save R200 vs two semesters',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-[#00CC99] font-bold mt-0.5">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/subscription')}
                    className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-lg font-bold hover:scale-105 transition"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Tutoring Pricing */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Tutoring Sessions</h3>
              <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Tutoring rates are set by individual tutors and vary based on subject, level, and experience.
                  Rates are displayed on each tutor's profile page.
                </p>
                <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-[#00CC99] mb-2">Booking Requirements</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Minimum booking: <strong>3 hours per session</strong></li>
                    <li>• Full payment required at time of booking confirmation</li>
                    <li>• All prices in South African Rand (ZAR)</li>
                    <li>• Secure payment via Paystack</li>
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/tutors')}
                  className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition"
                >
                  Browse Tutors & View Rates
                </button>
              </div>
            </div>

            {/* Payment Security Note */}
            <div className="glass-card rounded-xl p-6 max-w-3xl mx-auto text-center border border-[#00CC99]/20">
              <p className="text-[#00CC99] font-semibold">
                🔒 All payments are processed securely through Paystack, a trusted payment gateway.
                We never store your card details.
              </p>
            </div>
          </div>
        )}

        {/* ==================== TERMS TAB ==================== */}
        {activeTab === 'terms' && (
          <div className="glass-card rounded-xl p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Terms and Conditions</h2>
              <button
                onClick={() => navigate('/terms')}
                className="text-[#00CC99] text-sm hover:underline"
              >
                Open full page →
              </button>
            </div>
            <p className="text-gray-400 text-sm">Last updated: January 2026</p>

            {[
              { title: '1. Introduction', text: 'Welcome to Genius Accelerator. By accessing or using our platform at geniusaccelerator.co.za, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.' },
              { title: '2. Services', text: 'We offer academic tutoring (online and in-person), home-school support, relocation tutoring, exam preparation, academic coaching, upskilling courses, and access to the GPA AI tool.' },
              { title: '3. User Accounts', text: 'Users must provide accurate information, maintain account security, and notify us of unauthorized use. We may suspend accounts that violate these terms.' },
              { title: '4. Payment Terms', text: 'Minimum booking is 3 hours. Full payment is required before session confirmation. GPA subscriptions are available at R100/day, R250/month, R450/semester, or R700/year. Payments are processed via Paystack.' },
              { title: '5. Governing Law', text: 'These terms are governed by the laws of the Republic of South Africa. Disputes are subject to the jurisdiction of Gauteng courts.' },
            ].map((section, i) => (
              <section key={i}>
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-gray-300 leading-relaxed">{section.text}</p>
              </section>
            ))}

            <button
              onClick={() => navigate('/terms')}
              className="w-full py-3 border-2 border-[#00CC99] text-[#00CC99] rounded-lg font-semibold hover:bg-[#00CC99] hover:text-[#0f172a] transition"
            >
              Read Full Terms & Conditions
            </button>
          </div>
        )}

        {/* ==================== PRIVACY TAB ==================== */}
        {activeTab === 'privacy' && (
          <div className="glass-card rounded-xl p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Privacy Policy</h2>
              <button
                onClick={() => navigate('/privacy')}
                className="text-[#00CC99] text-sm hover:underline"
              >
                Open full page →
              </button>
            </div>
            <p className="text-gray-400 text-sm">Last updated: January 2026 | POPIA Compliant</p>

            {[
              { title: 'What We Collect', text: 'We collect identity info (name, photo), contact info (email, phone), academic info, payment info (processed by Paystack. We do not store card details), and usage data.' },
              { title: 'How We Use It', text: 'To manage your account, match students with tutors, process bookings and payments, provide the GPA tool, and improve our platform.' },
              { title: 'Who We Share With', text: 'We share with tutors (booking details only), Paystack (payment processing), Cloudinary (image storage), and OpenAI (GPA queries. No personal data shared). We never sell your data.' },
              { title: 'Your Rights (POPIA)', text: 'You have the right to access, correct, or delete your personal information, and to object to its processing. Contact us at admin@geniusaccelerator.co.za.' },
            ].map((section, i) => (
              <section key={i}>
                <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                <p className="text-gray-300 leading-relaxed">{section.text}</p>
              </section>
            ))}

            <button
              onClick={() => navigate('/privacy')}
              className="w-full py-3 border-2 border-[#00CC99] text-[#00CC99] rounded-lg font-semibold hover:bg-[#00CC99] hover:text-[#0f172a] transition"
            >
              Read Full Privacy Policy
            </button>
          </div>
        )}

        {/* ==================== REFUND TAB ==================== */}
        {activeTab === 'refund' && (
          <div className="glass-card rounded-xl p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold">Refund Policy</h2>
              <button
                onClick={() => navigate('/refund-policy')}
                className="text-[#00CC99] text-sm hover:underline"
              >
                Open full page →
              </button>
            </div>
            <p className="text-gray-400 text-sm">Last updated: January 2026 | CPA Compliant</p>

            <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-lg p-4">
              <h3 className="font-bold text-[#00CC99] mb-3">Tutoring Sessions</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Cancelled 24+ hours before:</strong> Full refund (5–7 business days)</p>
                <p><strong>Cancelled within 24 hours:</strong> 50% refund</p>
                <p><strong>No-show:</strong> No refund</p>
                <p><strong>Tutor cancels:</strong> Full refund always</p>
              </div>
            </div>

            <div className="bg-[#00CC99]/10 border border-[#00CC99]/30 rounded-lg p-4">
              <h3 className="font-bold text-[#00CC99] mb-3">GPA Subscriptions</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>Within 7 days (unused):</strong> Full refund</p>
                <p><strong>After 7 days:</strong> No refund for used subscriptions</p>
                <p><strong>Technical issues (72+ hrs downtime):</strong> Pro-rata refund or extension</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-bold mb-2">How to Request a Refund</h3>
              <p className="text-gray-300 text-sm">
                Email <a href="mailto:admin@geniusaccelerator.co.za" className="text-[#00CC99]">admin@geniusaccelerator.co.za</a> with your
                name, booking/payment reference, and reason. We respond within 1 business day.
              </p>
            </div>

            <button
              onClick={() => navigate('/refund-policy')}
              className="w-full py-3 border-2 border-[#00CC99] text-[#00CC99] rounded-lg font-semibold hover:bg-[#00CC99] hover:text-[#0f172a] transition"
            >
              Read Full Refund Policy
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PricingAndLegal;