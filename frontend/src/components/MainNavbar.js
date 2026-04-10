import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';

function MainNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const isLoggedIn = authService.isLoggedIn();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Check if current route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-[#0f172a] shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-2xl font-bold text-primary-800">
              Genius Prep
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Always visible links */}
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/') && location.pathname === '/'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => navigate('/tutors')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isActive('/tutors') && !location.pathname.includes('dashboard')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Find Tutors
            </button>

            {/* Logged in - Student/Tutor specific */}
            {isLoggedIn && currentUser && (
              <>
                <button
                  onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    isActive(`/${currentUser.role}/dashboard`)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>

                {currentUser.role === 'student' && (
                  <button
                    onClick={() => navigate('/gpa')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      isActive('/gpa')
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    AI Assistant
                  </button>
                )}
              </>
            )}
          </div>

          {/* Right side - Auth buttons or User menu */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {currentUser.email}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => navigate(`/${currentUser.role}/profile/edit`)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                      >
                        Edit Profile
                      </button>
                      {currentUser.role === 'student' && (
                        <button
                          onClick={() => navigate('/gpa')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          AI Assistant (GPA)
                        </button>
                      )}
                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => navigate('/admin')}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                        >
                          Admin Panel
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Home
            </button>
            <button
              onClick={() => { navigate('/tutors'); setMobileMenuOpen(false); }}
              className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Find Tutors
            </button>
            
            {isLoggedIn && currentUser && (
              <>
                <button
                  onClick={() => { navigate(`/${currentUser.role}/dashboard`); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { navigate(`/${currentUser.role}/profile/edit`); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                >
                  Edit Profile
                </button>
                {currentUser.role === 'student' && (
                  <button
                    onClick={() => { navigate('/gpa'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    AI Assistant
                  </button>
                )}
              </>
            )}

            <div className="border-t border-gray-200 pt-3 mt-3">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                    className="block w-full px-4 py-2 mt-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition text-center"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default MainNavbar;