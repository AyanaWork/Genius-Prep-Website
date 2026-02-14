const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    console.log('📸 Upload request received');
    console.log('File:', req.file);

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📤 Uploading to Cloudinary...');
    console.log('File path:', req.file.path);

    // Upload to Cloudinary - FIXED: Use req.file.path
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'genius-prep',
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Upload successful:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      details: error.message 
    });
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID required' });
    }

    console.log('🗑️ Deleting image:', publicId);

    await cloudinary.uploader.destroy(publicId);

    console.log('✅ Image deleted successfully');

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
};