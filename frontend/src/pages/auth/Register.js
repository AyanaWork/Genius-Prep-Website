import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authService.register(formData.email, formData.password, formData.role);
      navigate(formData.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src={companyLogo} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[#00CC99] font-black text-xl tracking-tighter">GENIUS</span>
              <span className="text-white/90 font-light text-xs tracking-[0.2em]">ACCELERATOR</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Create Account</h1>
          <p className="text-gray-400">Join the future of learning</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-3">I am a:</label>
              <div className="grid grid-cols-2 gap-4">
                {['student', 'tutor'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`py-4 rounded-xl text-center transition capitalize ${formData.role === role ? 'bg-[#00CC99] text-[#0f172a] font-bold' : 'bg-[#0f172a]/5 hover:bg-[#0f172a]/10 text-white'}`}
                  >
                    {role === 'student' ? '🎓 Student' : '👨‍🏫 Tutor'}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-[#00CC99] hover:underline">Sign in</button>
            </p>
          </div>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm">← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;