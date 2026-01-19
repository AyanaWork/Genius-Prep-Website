const pool = require('../config/database');

class TutorProfile {
  // Create new tutor profile
  static async create(userId, profileData) {
    const {
      displayName,
      bio,
      qualifications,
      subjects,
      moduleCodes, // NEW
      hourlyRate,
      yearsExperience,
      profilePictureUrl
    } = profileData;

    const query = `
      INSERT INTO tutor_profiles 
      (user_id, display_name, bio, qualifications, subjects, module_codes, 
       hourly_rate, years_experience, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      displayName,
      bio || null,
      qualifications || null,
      subjects || [],
      moduleCodes || [], // NEW
      hourlyRate || null,
      yearsExperience || null,
      profilePictureUrl || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update existing profile
  static async update(userId, profileData) {
    const {
      displayName,
      bio,
      qualifications,
      subjects,
      moduleCodes, // NEW
      hourlyRate,
      yearsExperience,
      profilePictureUrl
    } = profileData;

    const query = `
      UPDATE tutor_profiles 
      SET 
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        qualifications = COALESCE($3, qualifications),
        subjects = COALESCE($4, subjects),
        module_codes = COALESCE($5, module_codes),
        hourly_rate = COALESCE($6, hourly_rate),
        years_experience = COALESCE($7, years_experience),
        profile_picture_url = COALESCE($8, profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $9
      RETURNING *
    `;

    const values = [
      displayName,
      bio,
      qualifications,
      subjects,
      moduleCodes, // NEW
      hourlyRate,
      yearsExperience,
      profilePictureUrl,
      userId
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find profile by user ID
  static async findByUserId(userId) {
    const query = `
      SELECT 
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id AND r.is_published = TRUE
      WHERE tp.user_id = $1
      GROUP BY tp.id
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Find profile by profile ID
  static async findById(profileId) {
    const query = `
      SELECT 
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id AND r.is_published = TRUE
      WHERE tp.id = $1
      GROUP BY tp.id
    `;

    const result = await pool.query(query, [profileId]);
    return result.rows[0];
  }

  // Get all tutors with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id AND r.is_published = TRUE
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Filter by subject
    if (filters.subject) {
      conditions.push(`$${paramCount} = ANY(tp.subjects)`);
      values.push(filters.subject);
      paramCount++;
    }

    // Filter by module code (NEW)
    if (filters.moduleCode) {
      conditions.push(`$${paramCount} = ANY(tp.module_codes)`);
      values.push(filters.moduleCode);
      paramCount++;
    }

    // Filter by availability
    if (filters.availabilityStatus) {
      conditions.push(`tp.availability_status = $${paramCount}`);
      values.push(filters.availabilityStatus);
      paramCount++;
    }

    // Filter by elite status (NEW)
    if (filters.isElite !== undefined) {
      conditions.push(`tp.is_elite = $${paramCount}`);
      values.push(filters.isElite);
      paramCount++;
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY tp.id ORDER BY tp.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Toggle availability status
  static async toggleAvailability(userId) {
    const query = `
      UPDATE tutor_profiles 
      SET 
        availability_status = CASE 
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

  // Search tutors by name, subject, or module code
  static async search(searchTerm) {
    const query = `
      SELECT 
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id AND r.is_published = TRUE
      WHERE 
        tp.display_name ILIKE $1 OR
        EXISTS (
          SELECT 1 FROM unnest(tp.subjects) s WHERE s ILIKE $1
        ) OR
        EXISTS (
          SELECT 1 FROM unnest(tp.module_codes) m WHERE m ILIKE $1
        )
      GROUP BY tp.id
      ORDER BY tp.is_elite DESC, average_rating DESC
    `;

    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }
}

module.exports = TutorProfile;