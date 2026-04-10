import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

import tutoringImg from '../assets/images/tutoring.png';
import booksImg from '../assets/images/books.png';
import relocationImg from '../assets/images/relocation.png';
import examImg from '../assets/images/exam.png';
import assistantImg from '../assets/images/assistant.png';
import upskillingImg from '../assets/images/upskilling.png';
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
import companyLogo from '../assets/logos/GA_1.jpeg';

const useScrollReveal = (threshold = 0.1) => {
  const [ref, setRef] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
    }, { threshold });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return [setRef, isVisible];
};

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useScrollReveal(0.5);
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    let animationFrame;
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(updateCount);
    };
    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);
  return <span ref={ref}>{count}{suffix}</span>;
};

function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [procRef, procVis] = useScrollReveal(0.2);
  const [optRef, optVis] = useScrollReveal(0.1);
  const [courseRef, courseVis] = useScrollReveal(0.1);
  const [uniRef, uniVis] = useScrollReveal(0.1);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-[#00CC99]/30">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo - left */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <img src={companyLogo} alt="Logo" className="h-12 w-auto object-contain z-10 relative transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-[#00CC99] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[#00CC99] font-black text-xl tracking-tighter leading-none">GENIUS</span>
              <span className="text-white/90 font-light text-xs tracking-[0.2em] leading-none">ACCELERATOR</span>
            </div>
          </div>

          {/* Centered nav links - visible on md+ */}
          <div className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
            {['Process', 'Options', 'Courses'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-white/70 hover:text-[#00CC99] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00CC99] transition-all group-hover:w-full"></span>
              </a>
            ))}
            {!currentUser ? (
              <button onClick={() => navigate('/login')} className="text-sm font-semibold hover:text-[#00CC99] transition-colors">Login</button>
            ) : (
              <button onClick={() => navigate(`/${currentUser.role}/dashboard`)} className="text-sm font-semibold hover:text-[#00CC99] transition-colors">Dashboard</button>
            )}
          </div>

          {/* Right button */}
          <button 
            onClick={() => navigate(currentUser ? '/tutors' : '/register')}
            className="hidden md:block px-6 py-2.5 bg-[#00CC99] hover:bg-[#00b386] text-[#0f172a] rounded-full font-bold text-sm shadow-[0_0_20px_rgba(0,204,153,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            {!currentUser ?'Get Started' : 'Logout'}
          </button>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#00CC99]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00CC99]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00CC99]/10 border border-[#00CC99]/20 text-[#00CC99] text-xs font-bold mb-6 tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CC99] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00CC99]"></span>
              </span>
              Next-Gen Learning Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1]">
              Accelerate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00CC99] to-emerald-400">Future Success.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl leading-relaxed">
              Experience South Africa's premier tutoring ecosystem. We pair top-tier academic mentors with driven students to achieve unprecedented results.
            </p>
          <div className="flex flex-wrap gap-5">
            {/* Conditionally show "Find a tutor" */}
            {(!currentUser || currentUser.role === 'student') && (
              <button
                onClick={() => navigate(currentUser ? '/tutors' : '/register')}
                className="px-10 py-4 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold text-lg shadow-xl shadow-[#00CC99]/20 hover:scale-105 transition-transform"
              >
                Find a tutor
              </button>
            )}

            {/* Conditionally show "Become a tutor" */}
            {(!currentUser || currentUser.role === 'tutor') && (
              <button
                onClick={() => navigate(currentUser ? '/tutor/dashboard' : '/register')}
                className="px-10 py-4 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold text-lg shadow-xl shadow-[#00CC99]/20 hover:scale-105 transition-transform"
              >
                Become a tutor
              </button>
            )}

            {/* GPA AI button – always visible to logged in users */}
            {(!currentUser || currentUser.role === 'student') && (
              <button
                onClick={() => navigate('/gpa')}
                className="px-10 py-4 glass-card rounded-xl font-bold text-lg hover:border-[#00CC99]/50 transition-all"
              >
                GPA AI Assistant ⚡
              </button>
            )}
          </div>
            
            <div className="mt-12 flex gap-12 border-t border-white/5 pt-8">
              <div>
                <div className="text-3xl font-black text-[#00CC99] text-glow-green"><AnimatedCounter end={1000} suffix="+" /></div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Verified Tutors</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#00CC99] text-glow-green"><AnimatedCounter end={5000} suffix="+" /></div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Students Helped</div>
              </div>
                <div>
                <div className="text-3xl font-black text-[#00CC99] text-glow-green"><AnimatedCounter end={4.9} suffix="*" /></div>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">Average Rating</div>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#00CC99]/30 to-transparent blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
            <img 
              src="https://images.pexels.com/photos/8199175/pexels-photo-8199175.jpeg?auto=compress&cs=tinysrgb&w=1260" 
              className="relative rounded-3xl shadow-2xl border border-white/10 animate-float"
              alt="Student"
            />
          </div>
        </div>
      </section>

      {/* PROCESS SECTION with Background Image */}
      <section id="process" ref={procRef} className="relative py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1260)',
          }}
        >
          <div className="absolute inset-0 bg-[#0a101f]/85 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className={`text-center mb-20 transition-all duration-1000 ${procVis ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-black mb-4">The Acceleration <span className="text-[#00CC99]">Method</span></h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Our streamlined approach ensures you're matched with the right mentor in record time.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Analyze Needs", desc: "We identify your specific learning gaps using our proprietary assessment.", icon: "🎯" },
              { step: "02", title: "Smart Matching", desc: "Our algorithm pairs you with a top 1% tutor in your specific subject area.", icon: "🧠" },
              { step: "03", title: "Scale Growth", desc: "Track progress in real-time with digital dashboards and milestone reports.", icon: "📈" }
            ].map((item, i) => (
              <div key={i} className="glass-card p-10 rounded-3xl relative overflow-hidden group bg-[#0f172a]/80 backdrop-blur-md">
                <div className="text-6xl font-black text-white/5 absolute top-4 right-4 group-hover:text-[#00CC99]/10 transition-colors">{item.step}</div>
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPTIONS SECTION with Solid Background (matching original) */}
      <section id="options" ref={optRef} className="py-24 bg-[#1a2a3a]">
        <div className="container mx-auto px-6">
          <div className={`flex flex-col md:flex-row justify-between items-end mb-16 transition-all duration-1000 ${optVis ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Core <span className="text-[#00CC99]">Solutions</span></h2>
              <p className="text-gray-300">Tailored support for every stage of your academic journey.</p>
            </div>
            {/* <button className="hidden md:block text-[#00CC99] font-bold border-b-2 border-[#00CC99] pb-1 hover:text-white hover:border-white transition-all">View All Modules</button> */}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: tutoringImg, title: "1-on-1 Mentoring", desc: "Focused private sessions for University and High School excellence." },
              // { img: examImg, title: "Exam Crushing", desc: "Intensive prep for NBTs, SATs, and Matric finals." },
              { img: assistantImg, title: "AI Learning Tools", desc: "Harness the power of GPA AI to generate notes and mock tests." },
              // { img: booksImg, title: "Curriculum Support", desc: "Full coverage for NSC, IEB, Cambridge, and IB." },
              { img: upskillingImg, title: "Skill Up", desc: "Python, Data Science, and Machine Learning courses." },
              // { img: relocationImg, title: "Global Transition", desc: "Curriculum alignment for students moving abroad." }
            ].map((opt, i) => (
              <div key={i} className="glass-card p-8 rounded-3xl group bg-[#0f172a]/70 backdrop-blur-sm">
                <div className="h-40 flex items-center justify-center mb-6">
                  <img src={opt.img} alt={opt.title} className="max-h-full transition-transform group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#00CC99] transition-colors text-white">{opt.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES & SCHOOL SUBJECTS SECTION with Background Image */}
      <section id="courses" ref={courseRef} className="relative py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1260)',
          }}
        >
          <div className="absolute inset-0 bg-[#0a101f]/90 backdrop-blur-sm"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 ${courseVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Courses & <span className="text-[#00CC99]">School Subjects</span></h2>
            <p className="text-gray-300 max-w-2xl mx-auto">From high school to university level, we provide expert tutoring across all major subjects and faculties.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* High School Subjects Card */}
            <div className="glass-card p-8 rounded-2xl transition-all duration-300 hover:border-[#00CC99]/30 bg-[#0f172a]/80 backdrop-blur-md">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <span className="text-3xl">🏫</span> High Schools
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Mathematics', 'Physical Sciences', 'Life Sciences', 'Accounting',
                  'English', 'Afrikaans', 'Economics', 'Business Studies',
                  'Geography', 'History', 'AP Mathematics', 'Computer Applications Technology',
                  'Design', 'Life Orientation', 'Additional Languages'
                ].map((subject, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-[#00CC99]">✓</span>
                    <span>{subject}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* University Faculties Card */}
            <div className="glass-card p-8 rounded-2xl transition-all duration-300 hover:border-[#00CC99]/30 bg-[#0f172a]/80 backdrop-blur-md">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
                <span className="text-3xl">🎓</span> University Faculties
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Engineering & Built Environment', 'Natural Sciences & Agriculture',
                  'Commerce & Economic Sciences', 'Law (LLB)',
                  'Humanities & Social Sciences', 'Education (BEd)',
                  'Information Technology & CS', 'Health Sciences (MBChB/Nursing)',
                  'Mathematics & Statistics', 'All undergraduate & postgraduate modules'
                ].map((faculty, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-[#00CC99]">✓</span>
                    <span>{faculty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSITIES WE COVER SECTION */}
      <section ref={uniRef} className="py-24 bg-[#0f172a]">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-16 transition-all duration-1000 ${uniVis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Universities <span className="text-[#00CC99]">We Cover</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Our tutors are experts in modules from South Africa's top universities and institutions.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
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
                className="glass-card p-6 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#00CC99]/40 bg-[#0f172a]/80"
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
                  <div className="hidden w-24 h-24 bg-[#00CC99]/20 rounded-full items-center justify-center text-[#00CC99] font-bold text-xl">
                    {uni.name.split(' ').map(w => w[0]).join('')}
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-300">{uni.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a101f] border-t border-white/5 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* First column - Logo and Social */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <img src={companyLogo} className="h-10 opacity-80" alt="Logo" />
                <span className="font-black text-xl tracking-tighter text-[#00CC99]">GENIUS ACCELERATOR</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Revolutionizing education through technology and elite mentorship. Proudly accelerating South African talent.
              </p>
              <div className="flex gap-4">
                {/* Facebook */}
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#00CC99] hover:text-[#0f172a] hover:border-[#00CC99] transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#00CC99] hover:text-[#0f172a] hover:border-[#00CC99] transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.332.014 7.052.072 5.197.158 3.355.485 2.104 1.736.853 2.987.526 4.829.44 6.684.382 7.964.368 8.373.368 12s.014 4.036.072 5.316c.086 1.855.413 3.697 1.664 4.948 1.251 1.251 3.093 1.578 4.948 1.664 1.28.058 1.689.072 5.316.072s4.036-.014 5.316-.072c1.855-.086 3.697-.413 4.948-1.664 1.251-1.251 1.578-3.093 1.664-4.948.058-1.28.072-1.689.072-5.316s-.014-4.036-.072-5.316c-.086-1.855-.413-3.697-1.664-4.948C19.645.485 17.803.158 15.948.072 14.668.014 14.259 0 11 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 110 2.88 1.44 1.44 0 010-2.88z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#00CC99] hover:text-[#0f172a] hover:border-[#00CC99] transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C0.792 0 0 0.774 0 1.729v20.542C0 23.227 0.792 24 1.771 24h20.451c0.979 0 1.771-0.773 1.771-1.729V1.729C24 0.774 23.202 0 22.225 0z"/>
                  </svg>
                </a>
                {/* Twitter */}
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#00CC99] hover:text-[#0f172a] hover:border-[#00CC99] transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.678-11.51c0-.214-.005-.428-.015-.642A9.936 9.936 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform column */}
            <div>
              <h4 className="text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4">
                {["Find Tutors", "Become a Mentor", "GPA AI Tool", "Pricing"].map(l => (
                  <li key={l}><a href="#" className="text-gray-500 hover:text-[#00CC99] transition-colors text-sm">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Support column – with email added */}
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4">
                {["Help Center", "Safety Guidelines", "Terms of Use", "Privacy"].map(l => (
                  <li key={l}><a href="#" className="text-gray-500 hover:text-[#00CC99] transition-colors text-sm">{l}</a></li>
                ))}
                <li>
                  <a href="mailto:admin@geniusaccelerator.co.za" className="text-gray-500 hover:text-[#00CC99] transition-colors text-sm">
                    admin@geniusaccelerator.co.za
                  </a>
                </li>
              </ul>
            </div>

            {/* Subscribe column */}
            <div>
              <h4 className="text-white font-bold mb-6">Subscribe</h4>
              <p className="text-gray-500 text-sm mb-4">Get academic tips and platform updates.</p>
              <div className="relative">
                <input type="text" placeholder="Email address" className="w-full bg-[#0f172a]/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00CC99] transition-all" />
                <button className="absolute right-2 top-2 bg-[#00CC99] text-[#0f172a] px-4 py-1.5 rounded-lg text-xs font-bold">Join</button>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} Genius Accelerator. All Rights Reserved.
            </p>
            <button 
              onClick={() => window.scrollTo({top:0, behavior:'smooth'})} 
              className="text-[#00CC99] text-xs font-medium hover:underline transition-all"
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;