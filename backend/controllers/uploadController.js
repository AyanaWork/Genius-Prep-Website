const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No file provided' });
    }

    let fileBuffer;
    let fileName;
    let contentType;

    if (req.file) {
      // Multipart form data upload
      fileBuffer = req.file.buffer;
      const fileExt = req.file.originalname.split('.').pop();
      fileName = `${uuidv4()}.${fileExt}`;
      contentType = req.file.mimetype;
    } else {
      // Base64 upload
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
      fileName = `${uuidv4()}.jpg`;
      contentType = 'image/jpeg';
    }

    console.log('📤 Uploading to Supabase Storage:', fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tutor-documents')
      .upload(`profiles/${fileName}`, fileBuffer, {
        contentType: contentType,
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return res.status(500).json({ 
        error: 'Failed to upload file',
        details: error.message 
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tutor-documents')
      .getPublicUrl(`profiles/${fileName}`);

    console.log('✅ Upload successful:', publicUrl);

    res.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      publicId: data.path
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'No file path provided' });
    }

    console.log('🗑️  Deleting from Supabase:', publicId);

    const { error } = await supabase.storage
      .from('tutor-documents')
      .remove([publicId]);

    if (error) {
      console.error('❌ Delete error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete file',
        details: error.message 
      });
    }

    console.log('✅ File deleted successfully');

    res.json({ message: 'File deleted successfully' });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      error: 'Failed to delete file',
      details: error.message 
    });
  }
};