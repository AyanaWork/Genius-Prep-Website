import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import api from '../../services/api';
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
  const [idDocument, setIdDocument] = useState(null);
  const [transcript, setTranscript] = useState(null);
  
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
    profilePictureUrl: null,
    // NEW FIELDS for documents and approval
    id_document_url: null,
    transcript_url: null,
    approval_status: 'pending'
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
          profilePictureUrl: response.profile.profile_picture_url || null,
          id_document_url: response.profile.id_document_url || null,
          transcript_url: response.profile.transcript_url || null,
          approval_status: response.profile.approval_status || 'pending'
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
    setLoading(true);

    if (!formData.displayName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      setLoading(false);
      return;
    }

    try {
      const moduleCodesArray = formData.moduleCodes
        ? formData.moduleCodes.split(',').map(code => code.trim()).filter(Boolean)
        : [];

      // Upload ID document if new file selected
      let idDocUrl = formData.id_document_url;
      if (idDocument) {
        const idFormData = new FormData();
        idFormData.append('image', idDocument);
        const idResponse = await api.post('/upload/image', idFormData);
        idDocUrl = idResponse.data.url;
      }

      // Upload transcript if new file selected
      let transcriptUrl = formData.transcript_url;
      if (transcript) {
        const transcriptFormData = new FormData();
        transcriptFormData.append('image', transcript);
        const transcriptResponse = await api.post('/upload/image', transcriptFormData);
        transcriptUrl = transcriptResponse.data.url;
      }

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
        profile_picture_url: formData.profilePictureUrl,
        id_document_url: idDocUrl,
        transcript_url: transcriptUrl
      });

      setSuccess('Profile updated successfully! Your profile is now pending admin approval.');
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

            {/* Approval Status Display */}
            {formData.approval_status && (
              <div className={`p-4 rounded-lg border-l-4 ${
                formData.approval_status === 'approved' 
                  ? 'bg-green-50 border-green-500 text-green-800' :
                formData.approval_status === 'rejected' 
                  ? 'bg-red-50 border-red-500 text-red-800' :
                'bg-yellow-50 border-yellow-500 text-yellow-800'
              }`}>
                <p className="font-semibold text-lg mb-1">
                  Profile Status: {formData.approval_status.charAt(0).toUpperCase() + formData.approval_status.slice(1)}
                </p>
                {formData.approval_status === 'pending' && (
                  <p className="text-sm">Your profile is awaiting admin approval. You'll be able to accept bookings once ap-proved.</p>
                )}
                {formData.approval_status === 'approved' && (
                  <p className="text-sm">✓ Your profile has been approved! You can now accept student bookings.</p>
                )}
                {formData.approval_status === 'rejected' && formData.rejection_reason && (
                  <p className="text-sm mt-2">
                    <strong>Reason:</strong> {formData.rejection_reason}
                  </p>
                )}
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
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center border-4 border-primary-100 shadow-lg">
                    <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <ImageUpload 
                onImageUpload={handleImageUpload}
                buttonText="Upload Profile Picture"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="How you'd like students to address you"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio <span className="text-gray-500 font-normal">(Tell students about yourself)</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                placeholder="Share your teaching philosophy, experience, and what makes you a great tutor..."
              />
            </div>

            {/* Qualifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qualifications <span className="text-gray-500 font-normal">(Degrees, certifications)</span>
              </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., BSc Computer Science, TEFL Certified"
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Subjects You Teach <span className="text-red-500">*</span>
              </label>
              
              {/* Selected subjects */}
              {formData.subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-4 bg-primary-50 rounded-xl">
                  {formData.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="inline-flex items-center px-4 py-2 bg-white border-2 border-primary-200 text-primary-700 round-ed-full font-medium shadow-sm"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        className="ml-2 text-primary-500 hover:text-primary-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Subject options */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {SUBJECT_OPTIONS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleSubjectToggle(subject)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      formData.subjects.includes(subject)
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {/* Add custom subject */}
              {showCustomInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter custom subject"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  + Add Custom Subject
                </button>
              )}
            </div>

            {/* Module Codes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Module Codes <span className="text-gray-500 font-normal">(Comma-separated)</span>
              </label>
              <input
                type="text"
                name="moduleCodes"
                value={formData.moduleCodes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., MAT101, PHY201, CSC301"
              />
            </div>

            {/* Hourly Rate & Years Experience */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hourly Rate (ZAR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-500 font-medium">R</span>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 fo-cus:border-transparent transition"
                    placeholder="150"
                    min="0"
                    step="10"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 fo-cus:border-transparent transition"
                  placeholder="3"
                  min="0"
                />
              </div>
            </div>

            {/* Teaching Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Teaching Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TEACHING_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, teachingMode: mode }))}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition capitalize ${
                      formData.teachingMode === mode
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location <span className="text-gray-500 font-normal">(City, Province)</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="e.g., Cape Town, Western Cape"
              />
            </div>

            {/* DOCUMENT UPLOADS SECTION */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Required Documents for Verification
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Please upload your ID document and academic transcripts. Your profile will be reviewed by our team before going live.
              </p>
              
              {/* ID Document */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document (PDF, JPG, PNG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setIdDocument(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                />
                {formData.id_document_url && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ID document uploaded - 
                    <a href={formData.id_document_url} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                      View
                    </a>
                  </div>
                )}
              </div>

              {/* Academic Transcript */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Transcript (PDF, JPG, PNG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setTranscript(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-100 file:text-primary-700 hover:file:bg-primary-200"
                />
                {formData.transcript_url && (
                  <div className="mt-2 flex items-center text-sm text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Transcript uploaded - 
                    <a href={formData.transcript_url} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
              <button
                type="button"
                onClick={() => navigate('/tutor/dashboard')}
                className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transi-tion"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TutorProfileForm;
