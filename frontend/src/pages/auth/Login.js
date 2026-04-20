import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth';
import api from '../../services/api';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      const user = response.user;
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'tutor') navigate('/tutor/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }
    setResetLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMessage('Password reset link sent to your email.');
      setTimeout(() => {
        setShowResetModal(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to send reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={companyLogo} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[#00CC99] font-black text-xl tracking-tighter">GENIUS</span>
              <span className="text-white/90 font-light text-xs tracking-[0.2em]">ACCELERATOR</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your journey</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8">
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white"
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" className="rounded border-white/20 bg-[#0f172a]/5" /> Remember me
              </label>
              <button type="button" onClick={() => setShowResetModal(true)} className="text-sm text-[#00CC99] hover:underline">
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#00CC99] hover:underline">
                Create Account
              </Link>
            </p>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition text-sm flex items-center justify-center mx-auto gap-1">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowResetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-2xl font-bold mb-4 text-white">Reset Password</h2>
            {resetError && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{resetError}</div>}
            {resetMessage && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-xl mb-4">{resetMessage}</div>}
            <form onSubmit={handleForgotPassword}>
              <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] text-white mb-4" placeholder="Your email" required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-2 glass-card rounded-xl">Cancel</button>
                <button type="submit" disabled={resetLoading} className="flex-1 py-2 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold disabled:opacity-50">
                  {resetLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;