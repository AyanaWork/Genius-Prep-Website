const TutorProfile = require('../models/TutorProfile');

// Create or update tutor profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileData = req.body;

    // Check if profile already exists
    const existingProfile = await TutorProfile.findByUserId(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await TutorProfile.update(userId, profileData);
    } else {
      // Create new profile
      profile = await TutorProfile.create(userId, profileData);
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

// Get current tutor's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await TutorProfile.findByUserId(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Get tutor profile by ID (public view)
exports.getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await TutorProfile.findById(id);

    if (!profile) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get tutor error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};

// Get all tutors with filters
exports.getAllTutors = async (req, res) => {
  try {
    const { subject, availabilityStatus } = req.query;
    
    const filters = {};
    if (subject) filters.subject = subject;
    if (availabilityStatus) filters.availabilityStatus = availabilityStatus;

    const tutors = await TutorProfile.findAll(filters);

    res.json({ tutors, count: tutors.length });

  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

// Toggle availability status
exports.toggleAvailability = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await TutorProfile.toggleAvailability(userId);

    res.json({
      message: 'Availability updated',
      availabilityStatus: result.availability_status
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};