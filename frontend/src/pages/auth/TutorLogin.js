import React, { useState } from 'react';

function TutorLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      console.log('Tutor Login:', formData);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#2c3e50] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-auto md:h-[600px] bg-white grid grid-cols-1 md:grid-cols-2 rounded-xl overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="absolute top-4 right-5 text-white text-4xl font-light hover:text-gray-300 transition z-50"
        >
          ×
        </button>

        {/* Left Panel - Login Form */}
        <div className="bg-[#24364d] p-8 md:p-12 flex flex-col text-white">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-[#4A90E2] rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl">
              GP
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[#4A90E2] font-bold text-lg md:text-xl">GENIUS</span>
              <span className="text-white font-semibold text-sm md:text-base">PREP</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10">My GP Tutor Login</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="flex-1">
            {/* Email */}
            <div className="mb-5 md:mb-6">
              <label className="block text-sm mb-2 text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-none focus:ring-2 focus:ring-[#4A90E2] outline-none"
                placeholder="tutor@example.com"
              />
            </div>

            {/* Password */}
            <div className="mb-5 md:mb-6">
              <label className="block text-sm mb-2 text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-none focus:ring-2 focus:ring-[#4A90E2] outline-none"
                placeholder="************"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-[#3578f6] text-white rounded-lg font-semibold hover:bg-[#245fd1] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Forgot Password */}
            <button className="inline-block mt-5 text-sm text-gray-300 hover:text-white transition">
              Forgot your password?
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-300">
              Want to become a tutor?{' '}
              <button
                onClick={() => window.location.href = '/register?role=tutor'}
                className="font-semibold text-[#4A90E2] hover:text-[#357ABD] transition"
              >
                Apply here
              </button>
            </p>
          </div>
        </div>

        {/* Right Panel - Image (Different for tutors) */}
        <div className="hidden md:block relative">
          <img
            src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260"
            alt="Books and education"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default TutorLogin;