import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/auth';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const showStudentLinks = currentUser?.role === 'student';
  const showTutorLinks = currentUser?.role === 'tutor';
  const showAdminLinks = currentUser?.role === 'admin';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <img src={companyLogo} alt="Genius Accelerator" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-[#00CC99] font-black text-xl tracking-tighter leading-none">GENIUS</span>
            <span className="text-white/90 font-light text-xs tracking-[0.2em] leading-none">ACCELERATOR</span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate('/')} className={`text-sm font-medium transition ${
            isActive('/') && location.pathname === '/' ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
          }`}>Home</button>

          {currentUser?.role === 'student' && (
            <button onClick={() => navigate('/tutors')} className={`text-sm font-medium transition ${
              isActive('/tutors') ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
            }`}>Browse Tutors</button>
          )}

          <button onClick={() => navigate('/request-tutor')} className={`text-sm font-medium transition ${
            isActive('/request-tutor') ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
          }`}>Request a Tutor</button>

          {currentUser && (
            <button onClick={() => navigate('/documents')} className={`text-sm font-medium transition ${
              isActive('/documents') ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
            }`}>Documents</button>
          )}

          {(currentUser?.role === 'student' || currentUser?.role === 'tutor') && (showStudentLinks || showTutorLinks) && (
            <button onClick={() => navigate('/gpa')} className={`text-sm font-medium transition ${
              isActive('/gpa') ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
            }`}>GPA AI</button>
          )}

          {currentUser && (
            <button onClick={() => navigate(`/${currentUser.role}/dashboard`)} className={`text-sm font-medium transition ${
              isActive(`/${currentUser.role}/dashboard`) ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
            }`}>Dashboard</button>
          )}

          {showAdminLinks && (
            <button onClick={() => navigate('/admin/bookings')} className={`text-sm font-medium transition ${
              isActive('/admin/bookings') ? 'text-[#00CC99]' : 'text-white/70 hover:text-[#00CC99]'
            }`}>Bookings</button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-6">
          {!currentUser ? (
            <>
              <button onClick={() => navigate('/login')} className="text-sm text-white/70 hover:text-[#00CC99] transition">Sign In</button>
              <button onClick={() => navigate('/register')} className="px-6 py-2 bg-[#00CC99] text-[#0f172a] rounded-full font-bold text-sm hover:scale-105 transition">Get Started</button>
            </>
          ) : (
            <div className="relative">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2">
                {currentUser.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#00CC99]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#00CC99]/20 flex items-center justify-center border border-[#00CC99]">
                    <span className="text-[#00CC99] font-bold">{currentUser.email?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{currentUser.displayName || currentUser.email}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                  </div>

                  {showStudentLinks && (
                    <>
                      <button onClick={() => { navigate('/student/dashboard'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Dashboard</button>
                      <button onClick={() => { navigate('/student/profile/edit'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Edit Profile</button>
                      <button onClick={() => { navigate('/documents'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Documents</button>
                      <button onClick={() => { navigate('/gpa'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">GPA AI</button>
                    </>
                  )}

                  {showTutorLinks && (
                    <>
                      <button onClick={() => { navigate('/tutor/dashboard'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Dashboard</button>
                      <button onClick={() => { navigate('/tutor/profile/edit'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Edit Profile</button>
                      <button onClick={() => { navigate('/documents'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Documents</button>
                      <button onClick={() => { if (currentUser.tutorProfileId) navigate(`/tutors/${currentUser.tutorProfileId}`); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Public Profile</button>
                    </>
                  )}

                  {showAdminLinks && (
                    <>
                      <button onClick={() => { navigate('/admin/dashboard'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Dashboard</button>
                      <button onClick={() => { navigate('/admin/bookings'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Bookings</button>
                      <button onClick={() => { navigate('/documents'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-[#00CC99]">Documents</button>
                    </>
                  )}

                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-[#00CC99]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-md border-t border-white/10 mt-3 py-4">
          <div className="container mx-auto px-6 flex flex-col gap-3">
            <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Home</button>
            <button onClick={() => { navigate('/tutors'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Browse Tutors</button>
            <button onClick={() => { navigate('/request-tutor'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Request a Tutor</button>
            {currentUser && (
              <button onClick={() => { navigate('/documents'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Documents</button>
            )}
            {currentUser && (showStudentLinks || showTutorLinks) && (
              <button onClick={() => { navigate('/gpa'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">GPA AI</button>
            )}
            {currentUser && (
              <button onClick={() => { navigate(`/${currentUser.role}/dashboard`); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Dashboard</button>
            )}
            {!currentUser ? (
              <>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-left text-white/70 hover:text-[#00CC99] py-2">Sign In</button>
                <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }} className="px-6 py-2 bg-[#00CC99] text-[#0f172a] rounded-full font-bold text-center">Get Started</button>
              </>
            ) : (
              <button onClick={handleLogout} className="text-left text-red-400 py-2">Logout</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
