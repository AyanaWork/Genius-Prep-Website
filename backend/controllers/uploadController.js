const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary
exports.uploadImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'genius-prep/profiles',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Delete image from Cloudinary
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'No public ID provided' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};