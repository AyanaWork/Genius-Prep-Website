import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import ImageUpload from '../../components/common/ImageUpload';
import companyLogo from '../../assets/logos/GA_1.jpeg';  // <-- ADD THIS

const EDUCATION_LEVELS = ['Primary School', 'Grade 8-9', 'Grade 10-12', 'University - 1st Year', 'University - 2nd Year', 'University - 3rd Year', 'University - 4th Year', 'Postgraduate'];
const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Afrikaans', 'History', 'Geography', 'Accounting', 'Economics', 'Life Sciences', 'Computer Science', 'Business Studies', 'Engineering Mathematics', 'Statistics', 'Law', 'Psychology', 'Sociology', 'Political Science', 'Philosophy'];

function StudentProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ displayName: '', educationLevel: '', subjectsInterested: [], location: '', profilePictureUrl: null });
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await profileService.getStudentProfile();
      if (res.profile) setFormData({
        displayName: res.profile.display_name || '',
        educationLevel: res.profile.education_level || '',
        subjectsInterested: res.profile.subjects_interested || [],
        location: res.profile.location || '',
        profilePictureUrl: res.profile.profile_picture_url || null
      });
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubjectToggle = (subject) => setFormData(prev => ({
    ...prev,
    subjectsInterested: prev.subjectsInterested.includes(subject) ? prev.subjectsInterested.filter(s => s !== subject) : [...prev.subjectsInterested, subject]
  }));
  const handleRemoveSubject = (subject) => setFormData(prev => ({ ...prev, subjectsInterested: prev.subjectsInterested.filter(s => s !== subject) }));
  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !formData.subjectsInterested.includes(customSubject.trim())) {
      setFormData(prev => ({ ...prev, subjectsInterested: [...prev.subjectsInterested, customSubject.trim()] }));
      setCustomSubject('');
      setShowCustomInput(false);
    }
  };
  const handleImageUpload = (url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.displayName.trim()) return setError('Please enter your name');
    setLoading(true);
    try {
      await profileService.updateStudentProfile({
        display_name: formData.displayName,
        education_level: formData.educationLevel,
        subjects_interested: formData.subjectsInterested,
        location: formData.location,
        profile_picture_url: formData.profilePictureUrl
      });
      setSuccess('Profile saved! Redirecting...');
      setTimeout(() => navigate('/student/dashboard'), 1500);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/student/dashboard')} className="text-[#00CC99] hover:underline mb-6 inline-flex items-center gap-2">← Back to Dashboard</button>
        <div className="glass-card rounded-3xl p-8 md:p-12">
          {/* Logo and Title */}
          <div className="flex justify-center mb-6">
            <img src={companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-center">Your Student Profile</h1>
          <p className="text-gray-400 text-center mb-8">Tell us about yourself to get matched with the perfect tutors</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">{error}</div>}
            {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg">{success}</div>}

            <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/10">
              {formData.profilePictureUrl ? (
                <img src={formData.profilePictureUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-[#00CC99]" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                  <svg className="w-12 h-12 text-[#00CC99]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              )}
              <ImageUpload onImageUpload={handleImageUpload} buttonText="Upload Photo" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Your Name <span className="text-red-400">*</span></label>
              <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Education Level</label>
                <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl focus:border-[#00CC99]">
                  <option value="">Select</option>
                  {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-[#0f172a]/5 border border-white/10 rounded-xl" placeholder="e.g., Pretoria" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Subjects You're Interested In</label>
              {formData.subjectsInterested.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.subjectsInterested.map(s => (
                    <span key={s} className="px-3 py-1 bg-[#00CC99]/20 rounded-full text-sm flex items-center gap-2">{s}<button type="button" onClick={() => handleRemoveSubject(s)} className="text-[#00CC99]">×</button></span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SUBJECT_OPTIONS.map(sub => (
                  <button type="button" key={sub} onClick={() => handleSubjectToggle(sub)} className={`px-3 py-2 rounded-lg text-sm transition ${formData.subjectsInterested.includes(sub) ? 'bg-[#00CC99] text-[#0f172a]' : 'bg-[#0f172a]/5 hover:bg-[#0f172a]/10'}`}>{sub}</button>
                ))}
              </div>
              {showCustomInput ? (
                <div className="flex gap-2 mt-3">
                  <input type="text" value={customSubject} onChange={e => setCustomSubject(e.target.value)} className="flex-1 px-4 py-2 bg-[#0f172a]/5 border border-white/10 rounded-lg" placeholder="Subject name" />
                  <button type="button" onClick={handleAddCustomSubject} className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-semibold">Add</button>
                  <button type="button" onClick={() => setShowCustomInput(false)} className="px-4 py-2 bg-[#0f172a]/10 rounded-lg">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setShowCustomInput(true)} className="text-[#00CC99] text-sm mt-3">+ Add custom subject</button>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" onClick={() => navigate('/student/dashboard')} className="px-6 py-3 glass-card rounded-xl">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentProfileForm;