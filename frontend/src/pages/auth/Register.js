import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData.email, formData.password, formData.role);
      if (formData.role === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2c3e50] to-[#34495e] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#4A90E2] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              GP
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[#4A90E2] font-bold text-2xl">GENIUS</span>
              <span className="text-white font-semibold text-lg">PREP</span>
            </div>
          </div>
          <p className="text-gray-200 text-lg">Create your account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition"
              placeholder="At least 6 characters"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] outline-none transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Student Option */}
              <label className={`
                relative flex items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300
                ${formData.role === 'student'
                  ? 'border-[#4A90E2] bg-[#4A90E2]/5 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-4xl mb-2">🎓</div>
                  <div className={`font-semibold ${formData.role === 'student' ? 'text-[#4A90E2]' : 'text-gray-700'}`}>
                    Student
                  </div>
                </div>
              </label>

              {/* Tutor Option */}
              <label className={`
                relative flex items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-300
                ${formData.role === 'tutor'
                  ? 'border-[#4A90E2] bg-[#4A90E2]/5 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}>
                <input
                  type="radio"
                  name="role"
                  value="tutor"
                  checked={formData.role === 'tutor'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="text-4xl mb-2">👨🏻‍🏫</div>
                  <div className={`font-semibold ${formData.role === 'tutor' ? 'text-[#4A90E2]' : 'text-gray-700'}`}>
                    Tutor
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 px-4 bg-[#4A90E2] text-white rounded-lg text-base font-semibold hover:bg-[#357ABD] transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium text-[#4A90E2] hover:text-[#357ABD] transition"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="text-center pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;