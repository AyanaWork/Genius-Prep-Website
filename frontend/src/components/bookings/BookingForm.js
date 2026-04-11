import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import api from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';
import Navbar from '../../components/common/NavBar';


const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Afrikaans', 'History', 'Geography', 'Accounting', 'Economics', 'Life Sciences', 'Computer Science', 'Business Studies', 'Engineering Mathematics', 'Statistics', 'Law', 'Psychology', 'Sociology', 'Political Science', 'Philosophy', 'Programming', 'Data Science', 'Finance', 'Marketing', 'Management'];
const TEACHING_MODES = ['online', 'in-person', 'both'];

function TutorProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [idDocument, setIdDocument] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '', bio: '', qualifications: '', subjects: [], moduleCodes: '', hourlyRate: '', yearsExperience: '', teachingMode: 'both', location: '', profilePictureUrl: null,
    id_document_url: null, transcript_url: null, approval_status: 'pending'
  });
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const res = await profileService.getTutorProfile();
      if (res.profile) setFormData({
        displayName: res.profile.display_name || '',
        bio: res.profile.bio || '',
        qualifications: res.profile.qualifications || '',
        subjects: res.profile.subjects || [],
        moduleCodes: Array.isArray(res.profile.module_codes) ? res.profile.module_codes.join(', ') : '',
        hourlyRate: res.profile.hourly_rate || '',
        yearsExperience: res.profile.years_experience || '',
        teachingMode: res.profile.teaching_mode || 'both',
        location: res.profile.location || '',
        profilePictureUrl: res.profile.profile_picture_url || null,
        id_document_url: res.profile.id_document_url || null,
        transcript_url: res.profile.transcript_url || null,
        approval_status: res.profile.approval_status || 'pending'
      });
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubjectToggle = (subject) => setFormData(prev => ({
    ...prev,
    subjects: prev.subjects.includes(subject) ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject]
  }));
  const handleRemoveSubject = (subject) => setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !formData.subjects.includes(customSubject.trim())) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, customSubject.trim()] }));
      setCustomSubject('');
      setShowCustomInput(false);
    }
  };
  const handleImageUpload = (url) => setFormData(prev => ({ ...prev, profilePictureUrl: url }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.displayName.trim()) return setError('Please enter your name');
    if (formData.subjects.length === 0) return setError('Select at least one subject');
    setLoading(true);
    try {
      let idDocUrl = formData.id_document_url;
      if (idDocument) {
        const fd = new FormData(); fd.append('image', idDocument);
        const res = await api.post('/upload/image', fd);
        idDocUrl = res.data.url;
      }
      let transcriptUrl = formData.transcript_url;
      if (transcript) {
        const fd = new FormData(); fd.append('image', transcript);
        const res = await api.post('/upload/image', fd);
        transcriptUrl = res.data.url;
      }
      await profileService.updateTutorProfile({
        display_name: formData.displayName,
        bio: formData.bio,
        qualifications: formData.qualifications,
        subjects: formData.subjects,
        module_codes: formData.moduleCodes.split(',').map(c => c.trim()).filter(Boolean),
        hourly_rate: parseFloat(formData.hourlyRate) || 0,
        years_experience: parseInt(formData.yearsExperience) || 0,
        teaching_mode: formData.teachingMode,
        location: formData.location,
        profile_picture_url: formData.profilePictureUrl,
        id_document_url: idDocUrl,
        transcript_url: transcriptUrl
      });
      setSuccess('Profile updated! Pending admin approval.');
      setTimeout(() => navigate('/tutor/dashboard'), 1500);
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar /> {/* Global navbar replaces the old back button */}

      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-3xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-center">Your Tutor Profile</h1>
            <p className="text-gray-400 text-center mb-8">Create an impressive profile to attract students</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg">{error}</div>}
              {success && <div className="bg-green-500/20 border border-green-500 text-green-300 p-3 rounded-lg">{success}</div>}

              {formData.approval_status && (
                <div className={`p-4 rounded-lg border-l-4 ${formData.approval_status === 'approved' ? 'bg-green-500/10 border-green-500' : formData.approval_status === 'rejected' ? 'bg-red-500/10 border-red-500' : 'bg-yellow-500/10 border-yellow-500'}`}>
                  <p className="font-semibold">Status: {formData.approval_status.toUpperCase()}</p>
                  {formData.approval_status === 'pending' && <p className="text-sm">Awaiting admin review.</p>}
                </div>
              )}

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
                <label className="block text-sm font-semibold mb-2 text-white">Display Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                  placeholder="Tell students about your teaching style..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Qualifications</label>
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                  placeholder="BSc Computer Science, TEFL..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Subjects You Teach <span className="text-red-400">*</span></label>
                {formData.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[#1e2a3a] rounded-xl">
                    {formData.subjects.map(s => (
                      <span key={s} className="px-3 py-1 bg-[#00CC99]/20 rounded-full text-sm flex items-center gap-2 text-white">
                        {s}
                        <button type="button" onClick={() => handleRemoveSubject(s)} className="text-[#00CC99] hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBJECT_OPTIONS.map(sub => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => handleSubjectToggle(sub)}
                      className={`px-3 py-2 rounded-lg text-sm transition ${
                        formData.subjects.includes(sub)
                          ? 'bg-[#00CC99] text-[#0f172a] font-semibold'
                          : 'bg-[#1e2a3a] text-white hover:bg-[#00CC99]/20'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
                {showCustomInput ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={customSubject}
                      onChange={e => setCustomSubject(e.target.value)}
                      className="flex-1 px-4 py-2 bg-[#1e2a3a] border border-white/10 rounded-lg text-white placeholder-gray-400"
                      placeholder="Subject name"
                    />
                    <button type="button" onClick={handleAddCustomSubject} className="px-4 py-2 bg-[#00CC99] text-[#0f172a] rounded-lg font-semibold">Add</button>
                    <button type="button" onClick={() => setShowCustomInput(false)} className="px-4 py-2 bg-[#1e2a3a] text-white rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowCustomInput(true)} className="text-[#00CC99] text-sm mt-3 hover:underline">+ Add custom subject</button>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Module Codes (comma-separated)</label>
                <input
                  type="text"
                  name="moduleCodes"
                  value={formData.moduleCodes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                  placeholder="MAT101, PHY201"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Hourly Rate (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400">R</span>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                      placeholder="150"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-white">Years Experience</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Teaching Mode</label>
                <div className="flex gap-3">
                  {TEACHING_MODES.map(mode => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setFormData(prev => ({ ...prev, teachingMode: mode }))}
                      className={`px-6 py-2 rounded-xl capitalize transition ${
                        formData.teachingMode === mode
                          ? 'bg-[#00CC99] text-[#0f172a] font-bold'
                          : 'bg-[#1e2a3a] text-white hover:bg-[#00CC99]/20'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#1e2a3a] border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-400"
                  placeholder="Cape Town, Western Cape"
                />
              </div>

              {/* Document uploads */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-white">📄 Verification Documents</h3>
                <p className="text-sm text-gray-300 mb-4">ID and academic transcript required for approval.</p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-white">ID Document *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={e => setIdDocument(e.target.files[0])}
                    className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-[#00CC99]/20 file:text-[#00CC99] file:border-0 file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-white">Academic Transcript *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={e => setTranscript(e.target.files[0])}
                    className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-[#00CC99]/20 file:text-[#00CC99] file:border-0 file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
                <button type="button" onClick={() => navigate('/tutor/dashboard')} className="px-6 py-3 glass-card rounded-xl text-white hover:border-[#00CC99]/50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileForm;