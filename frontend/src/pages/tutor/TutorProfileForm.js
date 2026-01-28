import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import ImageUpload from '../../components/common/ImageUpload';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Afrikaans', 'History', 'Geography', 'Accounting', 'Economics',
  'Life Sciences', 'Computer Science', 'Business Studies',
  'Engineering Mathematics', 'Statistics', 'Law', 'Psychology',
  'Sociology', 'Political Science', 'Philosophy', 'Programming',
  'Data Science', 'Finance', 'Marketing', 'Management'
];

const TEACHING_MODES = ['online', 'in-person', 'both'];

function TutorProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    qualifications: '',
    subjects: [],
    moduleCodes: '',
    hourlyRate: '',
    yearsExperience: '',
    teachingMode: 'both',
    location: '',
    profilePictureUrl: null
  });

  const [customSubject, setCustomSubject] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileService.getTutorProfile();
      if (response.profile) {
        setFormData({
          displayName: response.profile.display_name || '',
          bio: response.profile.bio || '',
          qualifications: response.profile.qualifications || '',
          subjects: response.profile.subjects || [],
          moduleCodes: Array.isArray(response.profile.module_codes) 
            ? response.profile.module_codes.join(', ') 
            : '',
          hourlyRate: response.profile.hourly_rate || '',
          yearsExperience: response.profile.years_experience || '',
          teachingMode: response.profile.teaching_mode || 'both',
          location: response.profile.location || '',
          profilePictureUrl: response.profile.profile_picture_url || null
        });
      }
    } catch (err) {
      console.error('Load profile error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !formData.subjects.includes(customSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, customSubject.trim()]
      }));
      setCustomSubject('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: imageUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    try {
      setLoading(true);
      const moduleCodesArray = formData.moduleCodes
        ? formData.moduleCodes.split(',').map(code => code.trim()).filter(Boolean)
        : [];

      await profileService.updateTutorProfile({
        display_name: formData.displayName,
        bio: formData.bio,
        qualifications: formData.qualifications,
        subjects: formData.subjects,
        module_codes: moduleCodesArray,
        hourly_rate: parseFloat(formData.hourlyRate) || 0,
        years_experience: parseInt(formData.yearsExperience) || 0,
        teaching_mode: formData.teachingMode,
        location: formData.location,
        profile_picture_url: formData.profilePictureUrl
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/tutor/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/tutor/dashboard')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Tutor Profile</h1>
          <p className="text-lg text-gray-600">Create an impressive profile to attract more students</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Messages */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4 pb-8 border-b border-gray-200">
              <div className="relative">
                {formData.profilePictureUrl ? (
                  <img
                    src={formData.profilePictureUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-primary-100 shadow-lg">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <ImageUpload onImageUpload={handleImageUpload} />
              <p className="text-sm text-gray-500">Upload a professional photo to build trust with students</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="e.g., Dr. Jane Smith"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
                placeholder="Tell students about your teaching philosophy, experience, and what makes you a great tutor..."
              />
              <p className="mt-2 text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualifications & Education
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition resize-none"
                placeholder="e.g., MSc Mathematics - University of Pretoria, BSc Honours..."
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Subjects You Teach <span className="text-red-500">*</span>
              </label>
              
              {/* Selected Subjects */}
              {formData.subjects.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.subjects.map(subject => (
                    <span
                      key={subject}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="hover:bg-primary-200 rounded-full p-0.5 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Subject Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {SUBJECT_OPTIONS.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      formData.subjects.includes(subject)
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {/* Custom Subject Input */}
              {showCustomInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSubject())}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter custom subject..."
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-medium"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomSubject('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary-400 hover:text-primary-600 transition font-medium"
                >
                  + Add Other Subject
                </button>
              )}
            </div>

            {/* Module Codes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University Module Codes (Optional)
              </label>
              <input
                type="text"
                name="moduleCodes"
                value={formData.moduleCodes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="e.g., WTW 158, PHY 188, COS 110 (comma-separated)"
              />
              <p className="mt-2 text-sm text-gray-500">
                Separate multiple codes with commas
              </p>
            </div>

            {/* Teaching Mode & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teaching Mode
                </label>
                <select
                  name="teachingMode"
                  value={formData.teachingMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  {TEACHING_MODES.map(mode => (
                    <option key={mode} value={mode}>
                      {mode === 'both' ? 'Online & In-Person' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  placeholder="e.g., Pretoria, Gauteng"
                />
              </div>
            </div>

            {/* Hourly Rate & Experience */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hourly Rate (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R</span>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    placeholder="250"
                    min="0"
                    step="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                  placeholder="5"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/tutor/dashboard')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition shadow-lg disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileForm;