import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function TutorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);
      if (response.user.role !== 'tutor') throw new Error('Not a tutor account');
      navigate('/tutor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or not a tutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={companyLogo} alt="Logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Tutor Login</h1>
        </div>
        <div className="glass-card rounded-3xl p-8">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl text-white" required />
            <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl text-white" required />
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm">← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorLogin;