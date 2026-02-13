import React from 'react';
import { useNavigate } from 'react-router-dom';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-blue max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">1. Introduction</h2>
          <p className="text-gray-700 mb-4">
            Genius Prep Tuition (Pty) Ltd ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
          </p>
          <p className="text-gray-700 mb-4">
            This policy complies with the Protection of Personal Information Act (POPIA) of South Africa and other applicable data protection laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.1 Personal Information You Provide</h3>
          <p className="text-gray-700 mb-4">We collect information you directly provide to us:</p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>Account Information:</strong> Name, email address, password, role (student/tutor)</li>
            <li><strong>Profile Information:</strong> Display name, education level, subjects of interest, location, profile picture</li>
            <li><strong>Tutor-Specific Information:</strong> Qualifications, experience, subjects taught, hourly rate, ID documents, academic transcripts</li>
            <li><strong>Payment Information:</strong> Processed securely through PayFast (we do not store full credit card details)</li>
            <li><strong>Communication Data:</strong> Messages sent through our platform, booking requests, reviews</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.2 Information Automatically Collected</h3>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>GPA Usage:</strong> Questions asked, documents uploaded, AI interactions (for service improvement)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">2.3 Cookies and Tracking</h3>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the collected information for:</p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>Service Provision:</strong> To provide, maintain, and improve our educational services</li>
            <li><strong>Account Management:</strong> To create and manage your account</li>
            <li><strong>Matching Services:</strong> To match students with appropriate tutors</li>
            <li><strong>GPA Functionality:</strong> To provide AI-powered study assistance</li>
            <li><strong>Communication:</strong> To send service-related notifications, updates, and marketing (with your consent)</li>
            <li><strong>Payment Processing:</strong> To process transactions and prevent fraud</li>
            <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our terms</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">4. Information Sharing and Disclosure</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">4.1 With Other Users</h3>
          <p className="text-gray-700 mb-4">
            <strong>Tutor Profiles:</strong> Information in tutor profiles (name, qualifications, subjects, ratings) is publicly visible on the platform.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Student Information:</strong> When booking a tutor, limited student information (name, education level, subject) is shared with the tutor.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">4.2 With Service Providers</h3>
          <p className="text-gray-700 mb-4">We share information with trusted third parties who assist us in operating our platform:</p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>Payment Processing:</strong> PayFast (for secure payment processing)</li>
            <li><strong>Cloud Storage:</strong> Cloudinary (for image storage)</li>
            <li><strong>AI Services:</strong> OpenAI (for GPA functionality)</li>
            <li><strong>Hosting:</strong> Our hosting providers for server and database management</li>
          </ul>
          <p className="text-gray-700 mb-4">
            These providers are contractually obligated to protect your data and use it only for the specified purposes.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">4.3 Legal Requirements</h3>
          <p className="text-gray-700 mb-4">
            We may disclose your information if required by law or in response to valid legal requests from authorities.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-3">4.4 We Do NOT Sell Your Data</h3>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">5. Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational measures to protect your information:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Encryption of data in transit (HTTPS/SSL)</li>
            <li>Secure password hashing (bcrypt)</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure payment processing through PCI-compliant providers</li>
          </ul>
          <p className="text-gray-700 mb-4">
            However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your data.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">6. Your Privacy Rights (POPIA)</h2>
          <p className="text-gray-700 mb-4">Under POPIA, you have the right to:</p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal information we hold</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Object:</strong> Object to processing of your information for certain purposes</li>
            <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for processing (where applicable)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, contact us at hello@geniuspreptuition.co.za
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">7. Data Retention</h2>
          <p className="text-gray-700 mb-4">
            We retain your information for as long as necessary to:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Provide our services to you</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes and enforce our agreements</li>
          </ul>
          <p className="text-gray-700 mb-4">
            When you delete your account, we will delete or anonymize your personal information within 30 days, except for information we must retain for legal or legitimate business purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our platform is intended for users aged 13 and above. We do not knowingly collect information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately.
          </p>
          <p className="text-gray-700 mb-4">
            For users aged 13-18, we recommend parental guidance and supervision when using our services.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">9. International Data Transfers</h2>
          <p className="text-gray-700 mb-4">
            Your information may be transferred to and stored on servers located outside South Africa, including:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Cloud hosting providers (for database and file storage)</li>
            <li>OpenAI servers (for GPA AI processing)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            We ensure appropriate safeguards are in place for such transfers in compliance with POPIA.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">10. GPA AI Data Processing</h2>
          <p className="text-gray-700 mb-4">
            <strong>Chat Privacy:</strong> Your GPA conversations are private and stored securely. They are not shared with other users.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>AI Processing:</strong> Questions and documents you submit to GPA are processed by OpenAI's API. OpenAI's data usage policies apply to this processing.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Learning and Improvement:</strong> We may analyze aggregated, anonymized usage data to improve GPA functionality.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">11. Marketing Communications</h2>
          <p className="text-gray-700 mb-4">
            With your consent, we may send you:
          </p>
          <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
            <li>Platform updates and new feature announcements</li>
            <li>Educational content and study tips</li>
            <li>Special offers and promotions</li>
          </ul>
          <p className="text-gray-700 mb-4">
            You can opt out of marketing communications at any time by clicking the unsubscribe link in emails or adjusting your account settings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">12. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through a notice on our platform. Your continued use after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">13. Contact Us</h2>
          <p className="text-gray-700 mb-4">
            For questions or concerns about this Privacy Policy or our data practices, please contact:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700"><strong>Information Officer:</strong> Genius Prep Tuition (Pty) Ltd</p>
            <p className="text-gray-700"><strong>Email:</strong> hello@geniuspreptuition.co.za</p>
            <p className="text-gray-700"><strong>Phone:</strong> 071 961 7185</p>
            <p className="text-gray-700"><strong>Address:</strong> City of Tshwane, Gauteng, South Africa</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-4">14. Complaints</h2>
          <p className="text-gray-700 mb-4">
            If you believe your privacy rights have been violated, you have the right to lodge a complaint with:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700"><strong>Information Regulator South Africa</strong></p>
            <p className="text-gray-700">Email: inforeg@justice.gov.za</p>
            <p className="text-gray-700">Website: www.justice.gov.za/inforeg</p>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-600">
              By using Genius Prep Tuition, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.
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

export default PrivacyPolicy;