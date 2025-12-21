const pool = require('../config/database');

class StudentProfile {
  // Create student profile
  static async create(userId, profileData) {
    const {
      displayName,
      educationLevel,
      subjectsInterested,
      location,
      profilePictureUrl
    } = profileData;

    const query = `
      INSERT INTO student_profiles 
      (user_id, display_name, education_level, subjects_interested, location, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      displayName,
      educationLevel,
      subjectsInterested,
      location,
      profilePictureUrl || null
    ]);

    return result.rows[0];
  }

  // Get student profile by user ID
  static async findByUserId(userId) {
    const query = 'SELECT * FROM student_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Update student profile
  static async update(userId, profileData) {
    const {
      displayName,
      educationLevel,
      subjectsInterested,
      location,
      profilePictureUrl
    } = profileData;

    const query = `
      UPDATE student_profiles
      SET 
        display_name = COALESCE($1, display_name),
        education_level = COALESCE($2, education_level),
        subjects_interested = COALESCE($3, subjects_interested),
        location = COALESCE($4, location),
        profile_picture_url = COALESCE($5, profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [
      displayName,
      educationLevel,
      subjectsInterested,
      location,
      profilePictureUrl,
      userId
    ]);

    return result.rows[0];
  }
}

module.exports = StudentProfile;