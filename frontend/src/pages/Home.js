import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-800">
                Genius Prep Tuition
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition">
                How It Works
              </a>
              <a href="#services" className="text-gray-700 hover:text-primary-600 transition">
                Services
              </a>
              <a href="#tutors" className="text-gray-700 hover:text-primary-600 transition">
                Find Tutors
              </a>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-md"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <a href="#how-it-works" className="block text-gray-700">How It Works</a>
              <a href="#services" className="block text-gray-700">Services</a>
              <a href="#tutors" className="block text-gray-700">Find Tutors</a>
              <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-700">
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="block w-full px-6 py-2 bg-primary-600 text-white rounded-lg text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Redesigned */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Excel in Your Studies with
                <span className="text-secondary-400"> Expert Tutors</span>
              </h1>
              <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                Connect with qualified tutors across South Africa. From primary school to university level, 
                we help students achieve academic excellence through personalized one-on-one support.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register?role=student')}
                  className="px-8 py-4 bg-secondary-500 text-white rounded-lg text-lg font-semibold hover:bg-secondary-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Find a Tutor
                </button>
                <button
                  onClick={() => navigate('/register?role=tutor')}
                  className="px-8 py-4 bg-white text-primary-800 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg"
                >
                  Become a Tutor
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">1000+</div>
                  <div className="text-sm text-gray-300">Verified Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">5000+</div>
                  <div className="text-sm text-gray-300">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-400">4.9★</div>
                  <div className="text-sm text-gray-300">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-secondary-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <div className="text-white">
                        <div className="font-semibold">All Subjects Covered</div>
                        <div className="text-sm text-gray-300">Math, Science, Languages & More</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-2xl">
                        🎓
                      </div>
                      <div className="text-white">
                        <div className="font-semibold">Verified Tutors</div>
                        <div className="text-sm text-gray-300">Qualified & Background Checked</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                      <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-2xl">
                        💻
                      </div>
                      <div className="text-white">
                        <div className="font-semibold">Online & In-Person</div>
                        <div className="text-sm text-gray-300">Flexible Learning Options</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Simplified like 123tutors */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. We match you with the perfect tutor in three easy steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-hover transition text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Tell Us What You Need
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Share your subject, education level, and learning preferences. It takes less than 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-hover transition text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-secondary-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                We Match You
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our system finds the best tutors based on your needs, availability, and learning style.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-hover transition text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Learning
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Begin your lessons with ongoing support and track your academic progress.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/register?role=student')}
              className="px-10 py-4 bg-primary-600 text-white rounded-lg text-lg font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              Request a Tutor Now
            </button>
          </div>
        </div>
      </section>

      {/* Services Section - Clean Cards */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive academic support for every learning need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-100 hover:border-primary-300 transition">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                One-on-One Tutoring
              </h3>
              <p className="text-gray-600 mb-4">
                Personalized attention for all subjects from primary to university level, online or in-person.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Mathematics & Science</li>
                <li>✓ Languages & Arts</li>
                <li>✓ Commerce & Engineering</li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="bg-gradient-to-br from-secondary-50 to-white rounded-2xl p-8 border border-secondary-100 hover:border-secondary-300 transition">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Homeschool Support
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive support for NSC, IEB, and Cambridge curriculum students.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ AS & A Levels</li>
                <li>✓ Curriculum Planning</li>
                <li>✓ Progress Tracking</li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border border-green-100 hover:border-green-300 transition">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Relocation Tutoring
              </h3>
              <p className="text-gray-600 mb-4">
                Smooth transitions between different curricula for families moving abroad.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ CAPS to IGCSE</li>
                <li>✓ IB & A-Levels</li>
                <li>✓ AP Systems</li>
              </ul>
            </div>

            {/* Service 4 */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border border-purple-100 hover:border-purple-300 transition">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Exam Preparation
              </h3>
              <p className="text-gray-600 mb-4">
                Specialized preparation for NBT, SAT, and major assessments.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ NBT (Academic & Quantitative)</li>
                <li>✓ SAT Preparation</li>
                <li>✓ Matric Finals</li>
              </ul>
            </div>

            {/* Service 5 */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:border-blue-300 transition">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                AI Study Assistant
              </h3>
              <p className="text-gray-600 mb-4">
                Genius Prep Accelerator (GPA) helps generate notes, tests, and study materials.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Instant Note Generation</li>
                <li>✓ Practice Tests</li>
                <li>✓ Multi-Language Support</li>
              </ul>
            </div>

            {/* Service 6 */}
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border border-orange-100 hover:border-orange-300 transition">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Upskilling Courses
              </h3>
              <p className="text-gray-600 mb-4">
                Professional development in AI, machine learning, coding, and automation.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ AI & Machine Learning</li>
                <li>✓ Programming</li>
                <li>✓ Microsoft Tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join thousands of students achieving academic excellence with Genius Prep
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register?role=student')}
              className="px-10 py-4 bg-white text-primary-800 rounded-lg text-lg font-semibold hover:bg-gray-50 transition shadow-lg"
            >
              Find Your Tutor
            </button>
            <button
              onClick={() => navigate('/register?role=tutor')}
              className="px-10 py-4 bg-secondary-500 text-white rounded-lg text-lg font-semibold hover:bg-secondary-600 transition shadow-lg"
            >
              Become a Tutor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Genius Prep Tuition</h3>
              <p className="text-gray-400">
                Empowering students across South Africa with quality education and personalized tutoring.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-400">Phone: 071 961 7185</p>
              <p className="text-gray-400">Email: hello@geniuspreptuition.co.za</p>
              <p className="text-gray-400">Location: Pretoria, South Africa</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button onClick={() => navigate('/register')} className="block text-gray-400 hover:text-white">
                  Register
                </button>
                <button onClick={() => navigate('/login')} className="block text-gray-400 hover:text-white">
                  Login
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Genius Prep Tuition (PTY) LTD. All rights reserved.</p>
            <p className="mt-2 text-sm">Platform developed by Ayana Modise</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;