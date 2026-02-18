import React, { useState } from 'react';
import api from '../../services/api';

function ImageUpload({ currentImage, onImageChange, onImageUpload, buttonText = 'Upload Profile Picture' }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Accept either prop name — fixes the mismatch between forms
  const notifyParent = (url) => {
    if (onImageUpload) onImageUpload(url);
    if (onImageChange) onImageChange(url);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Step 1: Convert file to base64
      const base64 = await fileToBase64(file);

      // Step 2: Show local preview immediately so user sees something
      setPreview(base64);

      // Step 3: Upload to Cloudinary via backend
      const response = await api.post('/upload/image', {
        image: base64
      });

      // Step 4: Replace preview with the real Cloudinary URL
      const cloudinaryUrl = response.data.url;
      setPreview(cloudinaryUrl);

      // Step 5: Tell the parent form the real URL
      notifyParent(cloudinaryUrl);

    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
      setPreview(null);
      notifyParent(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    notifyParent(null);
  };

  // Helper: convert File to base64 string
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">

      {/* Error message */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Upload area */}
      {!preview ? (
        <label className={`cursor-pointer flex flex-col items-center justify-center w-full max-w-xs border-2 border-dashed rounded-xl p-6 transition ${
          uploading
            ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <>
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-blue-600 font-medium text-sm">Uploading...</p>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-gray-700">{buttonText}</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </>
          )}
        </label>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <img
            src={preview}
            alt="Profile preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Remove image
          </button>
        </div>
      )}

    </div>
  );
}

export default ImageUpload;