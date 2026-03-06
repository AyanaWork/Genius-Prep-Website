require('dotenv').config();
const cloudinary = require('../config/cloudinary');

const publicIds = [
  'genius-prep/profiles/lptzdrmmls52i1ceeaqu',
  'genius-prep/profiles/rdo7gxdamliwymefzfxw'
];

async function fixAccess() {
  console.log('🔧 Fixing Cloudinary access control...');
  
  for (const publicId of publicIds) {
    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        resource_type: 'image',
        access_control: [{ access_type: 'anonymous' }]
      });
      console.log(`✅ Fixed: ${publicId}`);
      console.log(`   URL: ${result.secure_url}`);
    } catch (error) {
      console.error(`❌ Error fixing ${publicId}:`, error.message);
    }
  }
  
  console.log('Done!');
}

fixAccess();