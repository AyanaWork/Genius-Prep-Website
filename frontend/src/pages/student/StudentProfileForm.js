import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import ImageUpload from '../../components/common/ImageUpload';
import './StudentProfileForm.css';

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
  'Life Sciences', 'Computer Science', 'Business Studies'
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
      console.log('No existing profile');
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

  const handleImageChange = async (imageData) => {
    if (!imageData) {
      setFormData(prev => ({ ...prev, profilePictureUrl: null }));
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.uploadImage(imageData);
      setFormData(prev => ({
        ...prev,
        profilePictureUrl: response.url
      }));
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.displayName || !formData.educationLevel) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await profileService.createStudentProfile({
        displayName: formData.displayName,
        educationLevel: formData.educationLevel,
        subjectsInterested: formData.subjectsInterested,
        location: formData.location,
        profilePictureUrl: formData.profilePictureUrl
      });

      setSuccess('Profile saved successfully!');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-form-page">
      <div className="profile-form-container">
        <div className="form-header">
          <h1 className="form-title">Complete Your Student Profile</h1>
          <p className="form-subtitle">Help tutors understand your learning needs</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          {error && (
            <div className="message error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              {success}
            </div>
          )}

          <ImageUpload
            currentImage={formData.profilePictureUrl}
            onImageChange={handleImageChange}
          />

          <div className="form-group">
            <label htmlFor="displayName" className="form-label">
              Display Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Sarah Smith"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="educationLevel" className="form-label">
              Education Level <span className="required">*</span>
            </label>
            <select
              id="educationLevel"
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select your education level</option>
              {EDUCATION_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Pretoria, Gauteng"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Subjects You Need Help With
            </label>
            <div className="subjects-grid">
              {SUBJECT_OPTIONS.map(subject => (
                <label key={subject} className="subject-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.subjectsInterested.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentProfileForm;