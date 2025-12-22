import React, { useState } from 'react';

function ImageUpload({ currentImage, onImageChange }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="image-upload">
      <label className="upload-label">Profile Picture</label>
      
      <div className="upload-container">
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Profile preview" className="preview-image" />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onImageChange(null);
              }}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ) : (
          <label className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <div className="upload-content">
              <div className="upload-icon">📷</div>
              <p className="upload-text">Click to upload image</p>
              <p className="upload-hint">PNG, JPG up to 5MB</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;