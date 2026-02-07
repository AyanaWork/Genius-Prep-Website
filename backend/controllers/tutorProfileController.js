const pool = require('../config/database');

/**
 * Get logged-in tutor's profile
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await pool.query(`
      SELECT 
        tp.*,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'id_document' 
         ORDER BY uploaded_at DESC LIMIT 1) as id_document_url,
        (SELECT document_url FROM tutor_documents 
         WHERE tutor_id = tp.id AND document_type = 'academic_transcript' 
         ORDER BY uploaded_at DESC LIMIT 1) as transcript_url,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.user_id = $1
      GROUP BY tp.id
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Create or update tutor profile
 */
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      display_name,
      bio,
      qualifications,
      subjects,
      module_codes,
      hourly_rate,
      years_experience,
      teaching_mode,
      location,
      profile_picture_url,
      id_document_url,
      transcript_url
    } = req.body;

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT id FROM tutor_profiles WHERE user_id = $1',
      [userId]
    );

    let result;
    
    if (existingProfile.rows.length > 0) {
      // Update existing profile
      result = await pool.query(
        `UPDATE tutor_profiles 
         SET 
           display_name = $1,
           bio = $2,
           qualifications = $3,
           subjects = $4,
           module_codes = $5,
           hourly_rate = $6,
           years_experience = $7,
           teaching_mode = $8,
           location = $9,
           profile_picture_url = $10,
           updated_at = NOW()
         WHERE user_id = $11
         RETURNING *`,
        [
          display_name,
          bio,
          qualifications,
          subjects,
          module_codes,
          hourly_rate,
          years_experience,
          teaching_mode,
          location,
          profile_picture_url,
          userId
        ]
      );

      const profileId = result.rows[0].id;

      // Update documents if provided
      if (id_document_url) {
        await pool.query(
          `INSERT INTO tutor_documents (tutor_id, document_type, document_url)
           VALUES ($1, 'id_document', $2)
           ON CONFLICT (tutor_id, document_type) 
           DO UPDATE SET document_url = $2, uploaded_at = NOW()`,
          [profileId, id_document_url]
        );
      }

      if (transcript_url) {
        await pool.query(
          `INSERT INTO tutor_documents (tutor_id, document_type, document_url)
           VALUES ($1, 'academic_transcript', $2)
           ON CONFLICT (tutor_id, document_type) 
           DO UPDATE SET document_url = $2, uploaded_at = NOW()`,
          [profileId, transcript_url]
        );
      }

    } else {
      // Create new profile - set to pending by default
      result = await pool.query(
        `INSERT INTO tutor_profiles 
         (user_id, display_name, bio, qualifications, subjects, module_codes, 
          hourly_rate, years_experience, teaching_mode, location, profile_picture_url,
          approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
         RETURNING *`,
        [
          userId,
          display_name,
          bio,
          qualifications,
          subjects,
          module_codes,
          hourly_rate,
          years_experience,
          teaching_mode,
          location,
          profile_picture_url
        ]
      );

      const profileId = result.rows[0].id;

      // Insert documents if provided
      if (id_document_url) {
        await pool.query(
          `INSERT INTO tutor_documents (tutor_id, document_type, document_url)
           VALUES ($1, 'id_document', $2)`,
          [profileId, id_document_url]
        );
      }

      if (transcript_url) {
        await pool.query(
          `INSERT INTO tutor_documents (tutor_id, document_type, document_url)
           VALUES ($1, 'academic_transcript', $2)`,
          [profileId, transcript_url]
        );
      }
    }

    res.json({
      message: 'Profile saved successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
};

/**
 * Toggle tutor availability
 */
const toggleAvailability = async (req, res) => {
  try {
    const userId = req.userId;

    // Get current status
    const currentStatus = await pool.query(
      'SELECT availability_status FROM tutor_profiles WHERE user_id = $1',
      [userId]
    );

    if (currentStatus.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const newStatus = currentStatus.rows[0].availability_status === 'active' ? 'inactive' : 'active';

    const result = await pool.query(
      `UPDATE tutor_profiles 
       SET availability_status = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING *`,
      [newStatus, userId]
    );

    res.json({
      message: 'Availability updated',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

/**
 * Get all approved tutors (public route)
 */
const getAllTutors = async (req, res) => {
  try {
    const { subject, availabilityStatus } = req.query;
    
    let query = `
      SELECT 
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.approval_status = 'approved'
    `;
    
    const params = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND $${paramCount} = ANY(tp.subjects)`;
      params.push(subject);
      paramCount++;
    }

    if (availabilityStatus) {
      query += ` AND tp.availability_status = $${paramCount}`;
      params.push(availabilityStatus);
      paramCount++;
    }

    query += ` GROUP BY tp.id ORDER BY tp.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({ tutors: result.rows, count: result.rows.length });

  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

/**
 * Get single tutor by ID (public route)
 */
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        tp.*,
        u.email,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.id = $1 AND tp.approval_status = 'approved'
      GROUP BY tp.id, u.email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ tutor: result.rows[0] });

  } catch (error) {
    console.error('Get tutor by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor' });
  }
};

module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  toggleAvailability,
  getAllTutors,
  getTutorById
};