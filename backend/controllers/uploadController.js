const cloudinary = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    let uploadResult;

    if (req.file) {
      // Use upload_stream for buffer uploads (multipart/form-data)
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'genius-prep/profiles',
            resource_type: 'auto',
            transformation: req.file.minetype.startsWith('image/') ? [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto' }
            ] : []
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    } else {
      // Base64 string sent via JSON body
      uploadResult = await cloudinary.uploader.upload(req.body.image, {
        folder: 'genius-prep/profiles',
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' }
        ]
      });
    }

    res.json({
      message: 'Image uploaded successfully',
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
};

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
