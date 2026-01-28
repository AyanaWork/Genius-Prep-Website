import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import ImageUpload from '../../components/common/ImageUpload';

const EDUCATION_LEVELS = [
  'Primary School',
  'Grade 8-9',
  'Grade 10-12',
  'University - 1st Year',
  'University - 2nd Year',
  'University - 3rd Year',
  'University - 4th Year',
  'Postgraduate'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Afrikaans', 'History', 'Geography', 'Accounting', 'Economics',
  'Life Sciences', 'Computer Science', 'Business Studies',
  'Engineering Mathematics', 'Statistics', 'Law', 'Psychology',
  'Sociology', 'Political Science', 'Philosophy'
];

function StudentProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    educationLevel: '',
    subjectsInterested: [],
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
      const response = await profileService.getStudentProfile();
      if (response.profile) {
        setFormData({
          displayName: response.profile.display_name || '',
          educationLevel: response.profile.education_level || '',
          subjectsInterested: response.profile.subjects_interested || [],
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
      subjectsInterested: prev.subjectsInterested.includes(subject)
        ? prev.subjectsInterested.filter(s => s !== subject)
        : [...prev.subjectsInterested, subject]
    }));
  };

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && !formData.subjectsInterested.includes(customSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjectsInterested: [...prev.subjectsInterested, customSubject.trim()]
      }));
      setCustomSubject('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjectsInterested: prev.subjectsInterested.filter(s => s !== subject)
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

    try {
      setLoading(true);
      await profileService.updateStudentProfile({
        display_name: formData.displayName,
        education_level: formData.educationLevel,
        subjects_interested: formData.subjectsInterested,
        location: formData.location,
        profile_picture_url: formData.profilePictureUrl
      });
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Your Student Profile</h1>
          <p className="text-lg text-gray-600">Tell us about yourself to get matched with the perfect tutors</p>
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
                placeholder="e.g., John Doe"
                required
              />
            </div>

            {/* Education Level & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Education Level
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                >
                  <option value="">Select your level</option>
                  {EDUCATION_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
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

            {/* Subjects Interested */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Subjects You're Interested In
              </label>
              
              {/* Selected Subjects */}
              {formData.subjectsInterested.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {formData.subjectsInterested.map(subject => (
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
                      formData.subjectsInterested.includes(subject)
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

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
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

export default StudentProfileForm;