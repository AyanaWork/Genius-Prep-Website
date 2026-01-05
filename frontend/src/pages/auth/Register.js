import React, { useState } from 'react';
import tutor from '../../assets/tutor.png';
import student from '../../assets/student.png';
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

      // Redirect based on role
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
    <div className="min-h-screen flex items-center justify-center bg-primary-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Genius Prep
          </h1>
          <p className="text-gray-200">Create your account</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="At least 6 characters"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="Confirm your password"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition
                  ${formData.role === 'student' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
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
                    <div className="text-3xl mb-2">
                      <img src={student} alt="Student" className="w-12 h-12 mx-auto" />
                    </div>
                    <div className={`font-semibold ${formData.role === 'student' ? 'text-primary-700' : 'text-gray-700'}`}>
                      Student
                    </div>
                  </div>
                </label>

                <label className={`
                  relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition
                  ${formData.role === 'tutor' 
                    ? 'border-primary-600 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
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
                    <div className="text-3xl mb-2">
                      <img src={tutor} alt="Tutor" className="w-12 h-12 mx-auto" />
                    </div>
                    <div className={`font-semibold ${formData.role === 'tutor' ? 'text-primary-700' : 'text-gray-700'}`}>
                      Tutor
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-secondary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-primary-600 hover:text-primary-700 transition"
                >
                  Sign in here
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                ← Back to home
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;