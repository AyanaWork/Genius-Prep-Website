import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import companyLogo from '../../assets/logos/GA_1.jpeg';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => { verifyToken(); }, []);

  const verifyToken = async () => {
    if (!token || !email) { setError('Invalid reset link.'); setVerifying(false); return; }
    try {
      await api.post('/auth/verify-reset-token', { email, token });
      setTokenValid(true);
    } catch (err) { setError(err.response?.data?.error || 'Invalid or expired link.'); }
    finally { setVerifying(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (formData.newPassword !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: formData.newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) { setError(err.response?.data?.error || 'Reset failed'); }
    finally { setLoading(false); }
  };

  if (verifying) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="spinner border-[#00CC99]"></div><p className="text-white ml-3">Verifying...</p></div>;
  if (!tokenValid) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-8 text-center max-w-md">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate('/login')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold">Back to Login</button>
      </div>
    </div>
  );
  if (success) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-8 text-center max-w-md">
        <div className="text-green-400 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
        <p className="text-gray-400 mb-6">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={companyLogo} alt="Logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
        </div>
        <div className="glass-card rounded-3xl p-8">
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">New Password</label>
              <input type="password" name="newPassword" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl text-white" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl text-white" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;