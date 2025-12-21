const pool = require('../config/database');

class TutorProfile {
  // Create tutor profile
  static async create(userId, profileData) {
    const {
      displayName,
      bio,
      qualifications,
      subjects,
      hourlyRate,
      yearsExperience,
      profilePictureUrl
    } = profileData;

    const query = `
      INSERT INTO tutor_profiles 
      (user_id, display_name, bio, qualifications, subjects, hourly_rate, years_experience, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      displayName,
      bio,
      qualifications,
      subjects,
      hourlyRate,
      yearsExperience,
      profilePictureUrl || null
    ]);

    return result.rows[0];
  }

  // Get tutor profile by user ID
  static async findByUserId(userId) {
    const query = 'SELECT * FROM tutor_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get tutor profile by profile ID
  static async findById(id) {
    const query = `
      SELECT tp.*, u.email, u.is_verified
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update tutor profile
  static async update(userId, profileData) {
    const {
      displayName,
      bio,
      qualifications,
      subjects,
      hourlyRate,
      yearsExperience,
      profilePictureUrl,
      availabilityStatus
    } = profileData;

    const query = `
      UPDATE tutor_profiles
      SET 
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        qualifications = COALESCE($3, qualifications),
        subjects = COALESCE($4, subjects),
        hourly_rate = COALESCE($5, hourly_rate),
        years_experience = COALESCE($6, years_experience),
        profile_picture_url = COALESCE($7, profile_picture_url),
        availability_status = COALESCE($8, availability_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $9
      RETURNING *
    `;

    const result = await pool.query(query, [
      displayName,
      bio,
      qualifications,
      subjects,
      hourlyRate,
      yearsExperience,
      profilePictureUrl,
      availabilityStatus,
      userId
    ]);

    return result.rows[0];
  }

  // Get all tutors (with optional filters)
  static async findAll(filters = {}) {
    let query = `
      SELECT tp.*, u.email
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE u.is_active = true
    `;

    const queryParams = [];
    let paramCount = 1;

    // Filter by subject
    if (filters.subject) {
      query += ` AND $${paramCount} = ANY(tp.subjects)`;
      queryParams.push(filters.subject);
      paramCount++;
    }

    // Filter by availability
    if (filters.availabilityStatus) {
      query += ` AND tp.availability_status = $${paramCount}`;
      queryParams.push(filters.availabilityStatus);
      paramCount++;
    }

    query += ' ORDER BY tp.created_at DESC';

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  // Toggle availability status
  static async toggleAvailability(userId) {
    const query = `
      UPDATE tutor_profiles
      SET availability_status = CASE 
        WHEN availability_status = 'active' THEN 'inactive'
        ELSE 'active'
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING availability_status
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = TutorProfile;