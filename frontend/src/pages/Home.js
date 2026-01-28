import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  
import authService from '../services/auth';

// Import images for tutoring options
import tutoringImg from '../assets/images/tutoring.png';
import booksImg from '../assets/images/books.png';
import relocationImg from '../assets/images/relocation.png';
import examImg from '../assets/images/exam.png';
import assistantImg from '../assets/images/assistant.png';
import upskillingImg from '../assets/images/upskilling.png';

// Import university logos
import upLogo from '../assets/images/up.jpeg';
import witsLogo from '../assets/images/wits.jpg';
import uctLogo from '../assets/images/uct.png';
import stelliesLogo from '../assets/images/stellies.jpeg';
import ujLogo from '../assets/images/uj.jpg';
import uwcLogo from '../assets/images/uwc.png';
import nwuLogo from '../assets/images/nwu.png';
import unisaLogo from '../assets/images/unisa.png';
import vcLogo from '../assets/images/vc.png';
import bostonLogo from '../assets/images/boston.webp';

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFindTutor = () => {
    if (!currentUser) {
      navigate('/register');
    } else {
      navigate('/tutors');
    }
  };

  const handleBecomeTutor = () => {
    if (!currentUser) {
      navigate('/register');
    } else if (currentUser.role === 'student') {
      if (window.confirm('Would you like to switch to a tutor account? You can always switch back later.')) {
        navigate('/tutor/profile/edit');
      }
    } else {
      alert('You are already registered as a tutor!');
      navigate('/tutor/dashboard');
    }
  };

  const handleBecomeStudent = () => {
    if (!currentUser) {
      navigate('/register');
    } else if (currentUser.role === 'tutor') {
      if (window.confirm('Would you like to switch to a student account? You can always switch back later.')) {
        navigate('/student/profile/edit');
      }
    } else {
      alert('You are already registered as a student!');
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#2c3e50]">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#2c3e50]/98 backdrop-blur-lg' : 'bg-[#2c3e50]/95'
      } border-b border-white/10`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-[#4A90E2] rounded-lg flex items-center justify-center text-white font-bold">
                GP
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[#4A90E2] font-bold text-lg">GENIUS</span>
                <span className="text-white font-semibold text-sm">PREP</span>
              </div>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {!currentUser ? (
                <>
                  <a href="#process" className="text-white hover:text-[#4A90E2] font-medium transition">Our Process</a>
                  <a href="#options" className="text-white hover:text-[#4A90E2] font-medium transition">Tutoring Options</a>
                  <button onClick={() => navigate('/login')} className="text-white hover:text-[#4A90E2] font-medium transition">Login</button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/')} 
                    className="text-white hover:text-[#4A90E2] font-medium transition"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => navigate(`/${currentUser.role}/dashboard`)} 
                    className="text-white hover:text-[#4A90E2] font-medium transition"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/gpa')} 
                    className="text-white hover:text-[#4A90E2] font-medium transition"
                  >
                    GPA AI
                  </button>
                </>
              )}
            </div>

            {/* CTA Button */}
            {!currentUser ? (
              <button 
                onClick={() => navigate('/register')} 
                className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg font-semibold hover:bg-[#357ABD] transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
              >
                Get Started
              </button>
            ) : (
              <button 
                onClick={() => {
                  authService.logout();
                  setCurrentUser(null);
                  navigate('/');
                }} 
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-stretch pt-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-0 items-stretch min-h-[calc(100vh-4rem)]">
            {/* Left Content */}
            <div className="flex flex-col justify-center py-12 lg:py-20 px-4 lg:px-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Unlock Your <span className="text-[#4A90E2]">Academic Potential</span> with Expert Tutors
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Connect with qualified tutors across South Africa. From high school to university level, 
                we provide personalised one-on-one support to help students achieve academic excellence.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={handleFindTutor}
                  className="px-8 py-4 bg-[#4A90E2] text-white rounded-lg text-lg font-semibold hover:bg-[#357ABD] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {currentUser ? 'Browse Tutors' : 'Find a Tutor'}
                </button>
                <button 
                  onClick={currentUser?.role === 'tutor' ? handleBecomeStudent : handleBecomeTutor}
                  className="px-8 py-4 bg-[#9b59b6] text-white rounded-lg text-lg font-semibold hover:bg-[#8e44ad] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {currentUser?.role === 'tutor' ? 'Become a Student' : 'Become a Tutor'}
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-8">
                <div className="text-left">
                  <div className="text-4xl font-bold text-[#4A90E2] leading-none">1000+</div>
                  <div className="text-sm text-gray-400 mt-1">Verified Tutors</div>
                </div>
                <div className="text-left">
                  <div className="text-4xl font-bold text-[#4A90E2] leading-none">5000+</div>
                  <div className="text-sm text-gray-400 mt-1">Students Helped</div>
                </div>
                <div className="text-left">
                  <div className="text-4xl font-bold text-[#4A90E2] leading-none">4.9 ★</div>
                  <div className="text-sm text-gray-400 mt-1">Average Rating</div>
                </div>
              </div>

              {/* AI Assistant Button */}
              <button 
                onClick={() => currentUser ? navigate('/gpa') : navigate('/register')}
                className="px-8 py-4 bg-white text-[#2c3e50] rounded-lg text-lg font-semibold hover:shadow-2xl transition-all duration-300 inline-block w-fit hover:-translate-y-1"
              >
                ⚛ GPA AI Assistant
              </button>
            </div>

            {/* Right Image */}
            <div className="hidden lg:block relative h-full">
              <img
                src="https://images.pexels.com/photos/8199175/pexels-photo-8199175.jpeg?auto=compress&cs=tinysrgb&w=1260"
                alt="Students studying together"
                className="absolute inset-0 w-full h-full object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section id="process" className="relative min-h-screen flex items-center justify-center py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1260)',
          }}
        >
          <div className="absolute inset-0 bg-[#142337]/85"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-white mb-4">Our Process</h2>
          <p className="text-xl text-gray-300 mb-16 max-w-2xl mx-auto">
            Getting started is simple. We match you with the perfect tutor in three easy steps.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: '1',
                title: 'Tell Us What You Need',
                description: 'Share your subject, education level, and learning preferences. It takes less than 2 minutes.'
              },
              {
                number: '2',
                title: 'We Match You',
                description: 'Our system finds the best tutors based on your needs, availability, and learning style.'
              },
              {
                number: '3',
                title: 'Start Learning',
                description: 'Begin your lessons with ongoing support and track your academic progress.'
              }
            ].map((step) => (
              <div key={step.number} className="bg-white/90 rounded-xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#1f2a44] text-white text-3xl font-bold rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutoring Options*/}
      <section id="options" className="bg-[#24364d] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-white text-center mb-16">Tutoring Options</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {[
              {
                image: tutoringImg,
                title: 'One-on-One Tutoring',
                description: 'Personalized attention for all subjects from primary to university level, online or in-person.',
                features: ['Mathematics & Science', 'Languages & Arts', 'Commerce & Engineering']
              },
              {
                image: booksImg,
                title: 'Homeschool Support',
                description: 'Comprehensive support for NSC, IEB, and Cambridge curriculum students.',
                features: ['AS & A Levels', 'Curriculum Planning', 'Progress Tracking']
              },
              {
                image: relocationImg,
                title: 'Relocation Tutoring',
                description: 'Smooth transitions between different curricula for families moving abroad.',
                features: ['CAPS to IGCSE', 'IB & A-Levels', 'AP Systems']
              },
              {
                image: examImg,
                title: 'Exam Preparation',
                description: 'Specialised preparation for NBT, SAT, and major assessments.',
                features: ['NBT (Academic & Quantitative)', 'SAT Preparation', 'Matric Finals']
              },
              {
                image: assistantImg,
                title: 'AI Study Assistant',
                description: 'Genius Prep Accelerator (GPA) helps generate notes, tests, and study materials.',
                features: ['Instant Note Generation', 'Practice Tests', 'Multi-Language Support']
              },
              {
                image: upskillingImg,
                title: 'Upskilling Courses',
                description: 'Professional development in AI, Machine Learning, Coding, and Automation.',
                features: ['AI & Machine Learning', 'Programming', 'Microsoft Tools']
              }
            ].map((option, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-8 hover:bg-white/10 transition-all duration-300 border border-white/10">
                <div className="mb-6 flex justify-center">
                  <img 
                    src={option.image} 
                    alt={option.title}
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-5xl hidden">{['🎓', '📚', '✈️', '📝', '🤖', '💻'][index]}</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{option.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{option.description}</p>
                <ul className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="text-gray-400 text-sm flex items-start">
                      <span className="text-[#4A90E2] mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & School Subjects Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260)',
          }}
        >
          <div className="absolute inset-0 bg-[#142337]/90"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <h2 className="text-5xl font-bold text-white text-center mb-4">Courses & School Subjects We Cover</h2>
          <p className="text-xl text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            From high school to university level, we provide expert tutoring across all major subjects and faculties
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* High Schools */}
            <div className="bg-white/95 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-[#2c3e50] mb-6 flex items-center">
                High Schools
              </h3>
              <ul className="space-y-3">
                {[
                  'Mathematics',
                  'Physical Sciences',
                  'Life Sciences',
                  'Accounting',
                  'All Official Languages (English, Afrikaans, Zulu, etc.)',
                  'Economics',
                  'Design',
                  'Geography',
                  'Business Studies',
                  'AP Mathematics',
                  'History',
                  'Computer Applications Technology',
                  'and many more...'
                ].map((subject, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-[#4A90E2] font-bold mr-3">✓</span>
                    <span className="font-medium">{subject}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* University Faculties */}
            <div className="bg-white/95 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold text-[#2c3e50] mb-6 flex items-center">
                University Faculties
              </h3>
              <ul className="space-y-3">
                {[
                  'Engineering & Built Environment (BEng / BArch)',
                  'Natural Sciences & Agriculture (BSc)',
                  'Commerce & Economic and Management Sciences (BCom)',
                  'Law (LLB)',
                  'Humanities & Social Sciences (BA / BSocSci)',
                  'Education (BEd)',
                  'Information Technology & Computer Science (BScIT)',
                  'Health Sciences (MBChB / Nursing)',
                  'Mathematics & Statistics',
                  'All undergraduate and postgraduate modules'
                ].map((faculty, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start">
                    <span className="text-[#4A90E2] font-bold mr-3">✓</span>
                    <span className="font-medium">{faculty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Universities We Cover Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-[#2c3e50] text-center mb-4">Universities We Cover</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Our tutors are experts in modules from South Africa's top universities and institutions
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
            {[
              { logo: upLogo, name: 'University of Pretoria' },
              { logo: witsLogo, name: 'University of Witwatersrand' },
              { logo: uctLogo, name: 'University of Cape Town' },
              { logo: stelliesLogo, name: 'Stellenbosch University' },
              { logo: ujLogo, name: 'University of Johannesburg' },
              { logo: uwcLogo, name: 'University of the Western Cape' },
              { logo: nwuLogo, name: 'North West University' },
              { logo: unisaLogo, name: 'University of South Africa' },
              { logo: vcLogo, name: 'Varsity College' },
              { logo: bostonLogo, name: 'Boston Campus' }
            ].map((uni, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col items-center justify-center"
              >
                <div className="w-24 h-24 mb-4 flex items-center justify-center">
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-24 h-24 bg-[#4A90E2] rounded-full items-center justify-center text-white font-bold text-xl">
                    {uni.name.split(' ').map(w => w[0]).join('')}
                  </div>
                </div>
                <p className="text-center text-sm font-semibold text-gray-700">{uni.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a2332] py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#4A90E2] rounded-lg flex items-center justify-center text-white font-bold">
                  GP
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[#4A90E2] font-bold text-lg">GENIUS</span>
                  <span className="text-white font-semibold text-sm">PREP TUITION</span>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering students across South Africa with quality education and expert tutoring services.
              </p>
              <p className="text-gray-400">
                ✉ hello@geniuspreptuition.co.za<br/>
                ☎ 071 961 7185
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/tutors')} className="text-gray-400 hover:text-[#4A90E2] transition">
                    Find Tutors
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-[#4A90E2] transition">
                    Become a Tutor
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/gpa')} className="text-gray-400 hover:text-[#4A90E2] transition">
                    GPA AI Tool
                  </button>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-white font-bold mb-4">Account</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-[#4A90E2] transition">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/register')} className="text-gray-400 hover:text-[#4A90E2] transition">
                    Register
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2026 Genius Prep Tuition. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;