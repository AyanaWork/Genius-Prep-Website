import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import ImageUpload from '../../components/common/ImageUpload';
import './TutorProfileForm.css';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Afrikaans', 'History', 'Geography', 'Accounting', 'Economics',
  'Life Sciences', 'Computer Science', 'Business Studies'
];

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
    hourlyRate: '',
    yearsExperience: '',
    profilePictureUrl: null
  });

  // Load existing profile if it exists
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
          hourlyRate: response.profile.hourly_rate || '',
          yearsExperience: response.profile.years_experience || '',
          profilePictureUrl: response.profile.profile_picture_url || null
        });
      }
    } catch (err) {
      // Profile doesn't exist yet, that's fine
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
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
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

    // Validation
    if (!formData.displayName || !formData.bio) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      setLoading(false);
      return;
    }

    try {
      await profileService.createTutorProfile({
        displayName: formData.displayName,
        bio: formData.bio,
        qualifications: formData.qualifications,
        subjects: formData.subjects,
        hourlyRate: parseFloat(formData.hourlyRate) || null,
        yearsExperience: parseInt(formData.yearsExperience) || null,
        profilePictureUrl: formData.profilePictureUrl
      });

      setSuccess('Profile saved successfully!');
      setTimeout(() => {
        navigate('/tutor/dashboard');
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
          <h1 className="form-title">Complete Your Tutor Profile</h1>
          <p className="form-subtitle">Let students know about your expertise and experience</p>
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

          {/* Profile Picture */}
          <ImageUpload
            currentImage={formData.profilePictureUrl}
            onImageChange={handleImageChange}
          />

          {/* Display Name */}
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
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              Bio <span className="required">*</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Tell students about yourself, your teaching style, and experience..."
              rows="5"
              required
            />
            <span className="char-count">{formData.bio.length} characters</span>
          </div>

          {/* Qualifications */}
          <div className="form-group">
            <label htmlFor="qualifications" className="form-label">
              Qualifications
            </label>
            <textarea
              id="qualifications"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="form-textarea"
              placeholder="e.g., BSc Mathematics, PGCE, Honours in Education"
              rows="3"
            />
          </div>

          {/* Subjects */}
          <div className="form-group">
            <label className="form-label">
              Subjects You Teach <span className="required">*</span>
            </label>
            <div className="subjects-grid">
              {SUBJECT_OPTIONS.map(subject => (
                <label key={subject} className="subject-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.subjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
            <p className="form-hint">Select all subjects you can teach</p>
          </div>

          {/* Hourly Rate */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate (ZAR)
              </label>
              <input
                type="number"
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="form-input"
                placeholder="250"
                min="0"
                step="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearsExperience" className="form-label">
                Years of Experience
              </label>
              <input
                type="number"
                id="yearsExperience"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleChange}
                className="form-input"
                placeholder="5"
                min="0"
                max="50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/tutor/dashboard')}
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

export default TutorProfileForm;