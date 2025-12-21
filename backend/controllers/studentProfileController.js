const StudentProfile = require('../models/StudentProfile');

// Create or update student profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    // Check if profile already exists
    const existingProfile = await StudentProfile.findByUserId(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await StudentProfile.update(userId, profileData);
    } else {
      // Create new profile
      profile = await StudentProfile.create(userId, profileData);
    }

    res.json({
      message: 'Profile saved successfully',
      profile
    });

  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

// Get current student's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await StudentProfile.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};