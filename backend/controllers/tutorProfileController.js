const pool = require('../config/database');

/**
 * Strip fields that must never be returned to non-admin callers.
 * Currently: phone_number (admin-only by product requirement).
 *
 * Always run any tutor object through this before sending to a public
 * or non-admin requester. Defence-in-depth: even if a SQL query
 * accidentally selects phone_number, this scrubs it from the response.
 */
const stripPrivateFields = (tutor) => {
  if (!tutor) return tutor;
  const { phone_number, ...safe } = tutor;
  return safe;
};

const stripPrivateFieldsList = (tutors) =>
  Array.isArray(tutors) ? tutors.map(stripPrivateFields) : tutors;

/**
 * Get logged-in tutor's profile (the tutor sees their own phone)
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

    // The tutor themselves CAN see their own phone number.
    res.json({ profile: result.rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Create or update tutor profile.
 * Now includes phone_number (which is admin-only at read time but
 * captured here when the tutor fills out their form).
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
      phone_number,
      id_document_url,
      transcript_url
    } = req.body;

    // Lightweight phone validation: digits, +, spaces, dashes, parens.
    // Rejects obviously bogus input but leaves room for international
    // formats. Empty string is allowed (existing rows might not have it).
    if (phone_number && !/^[+0-9 ()\-]{6,20}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const existingProfile = await pool.query(
      'SELECT id FROM tutor_profiles WHERE user_id = $1',
      [userId]
    );

    let result;

    if (existingProfile.rows.length > 0) {
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
           phone_number = COALESCE($11, phone_number),
           updated_at = NOW()
         WHERE user_id = $12
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
          phone_number || null,
          userId
        ]
      );

      const profileId = result.rows[0].id;

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
      result = await pool.query(
        `INSERT INTO tutor_profiles
         (user_id, display_name, bio, qualifications, subjects, module_codes,
          hourly_rate, years_experience, teaching_mode, location, profile_picture_url,
          phone_number, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
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
          profile_picture_url,
          phone_number || null
        ]
      );

      const profileId = result.rows[0].id;

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
 * Get all approved tutors (public route).
 * Now supports:
 *   - subject filter
 *   - moduleCode filter (NEW)
 *   - q free-text search across name/subjects/module_codes (NEW)
 *   - sort: rating | rate_asc | rate_desc | newest | elite (NEW)
 *   - pagination via page + limit (NEW)
 *
 * Phone numbers are stripped before responding.
 */
const getAllTutors = async (req, res) => {
  try {
    const {
      subject,
      moduleCode,
      q,
      availabilityStatus,
      sort = 'elite',
      page = 1,
      limit = 24
    } = req.query;

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

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

    if (moduleCode) {
      // Case-insensitive exact match against any element of module_codes.
      query += ` AND EXISTS (
        SELECT 1 FROM unnest(tp.module_codes) m WHERE UPPER(m) = UPPER($${paramCount})
      )`;
      params.push(moduleCode);
      paramCount++;
    }

    if (q && q.trim()) {
      // Free-text "type to search" — matches name, any subject, any module code.
      query += ` AND (
        tp.display_name ILIKE $${paramCount}
        OR EXISTS (SELECT 1 FROM unnest(tp.subjects) s WHERE s ILIKE $${paramCount})
        OR EXISTS (SELECT 1 FROM unnest(tp.module_codes) m WHERE m ILIKE $${paramCount})
      )`;
      params.push(`%${q.trim()}%`);
      paramCount++;
    }

    if (availabilityStatus) {
      query += ` AND tp.availability_status = $${paramCount}`;
      params.push(availabilityStatus);
      paramCount++;
    }

    query += ` GROUP BY tp.id`;

    // Sort: whitelist to avoid SQL injection.
    const sortClauses = {
      rating: 'ORDER BY average_rating DESC, review_count DESC',
      rate_asc: 'ORDER BY tp.hourly_rate ASC NULLS LAST',
      rate_desc: 'ORDER BY tp.hourly_rate DESC NULLS LAST',
      newest: 'ORDER BY tp.created_at DESC',
      elite: 'ORDER BY tp.is_elite DESC, average_rating DESC, tp.created_at DESC'
    };
    query += ' ' + (sortClauses[sort] || sortClauses.elite);

    // Run a separate count query that mirrors the WHERE clause above so
    // the pagination UI can show "page X of N". Cheaper than scanning the
    // full result set after pagination is applied.
    const countWhereParts = ['tp.approval_status = $1'];
    const countBindings = ['approved'];
    let cIdx = 2;
    if (subject) {
      countWhereParts.push(`$${cIdx} = ANY(tp.subjects)`);
      countBindings.push(subject);
      cIdx++;
    }
    if (moduleCode) {
      countWhereParts.push(`EXISTS (SELECT 1 FROM unnest(tp.module_codes) m WHERE UPPER(m) = UPPER($${cIdx}))`);
      countBindings.push(moduleCode);
      cIdx++;
    }
    if (q && q.trim()) {
      countWhereParts.push(`(
        tp.display_name ILIKE $${cIdx}
        OR EXISTS (SELECT 1 FROM unnest(tp.subjects) s WHERE s ILIKE $${cIdx})
        OR EXISTS (SELECT 1 FROM unnest(tp.module_codes) m WHERE m ILIKE $${cIdx})
      )`);
      countBindings.push(`%${q.trim()}%`);
      cIdx++;
    }
    if (availabilityStatus) {
      countWhereParts.push(`tp.availability_status = $${cIdx}`);
      countBindings.push(availabilityStatus);
      cIdx++;
    }
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM tutor_profiles tp WHERE ${countWhereParts.join(' AND ')}`,
      countBindings
    );
    const total = countResult.rows[0]?.total || 0;

    // Apply LIMIT/OFFSET to the main query.
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(safeLimit, offset);

    const result = await pool.query(query, params);

    res.json({
      tutors: stripPrivateFieldsList(result.rows),
      count: result.rows.length,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    });

  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
};

/**
 * Search tutors (q only) — used by autocomplete and the search bar.
 * Lightweight: returns up to 50 ordered by elite + rating.
 */
const searchTutors = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const term = q.trim();

    if (!term) {
      return res.json({ tutors: [] });
    }

    const result = await pool.query(`
      SELECT
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM tutor_profiles tp
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.approval_status = 'approved'
        AND (
          tp.display_name ILIKE $1
          OR EXISTS (SELECT 1 FROM unnest(tp.subjects) s WHERE s ILIKE $1)
          OR EXISTS (SELECT 1 FROM unnest(tp.module_codes) m WHERE m ILIKE $1)
        )
      GROUP BY tp.id
      ORDER BY tp.is_elite DESC, average_rating DESC
      LIMIT 50
    `, [`%${term}%`]);

    res.json({ tutors: stripPrivateFieldsList(result.rows) });

  } catch (error) {
    console.error('Search tutors error:', error);
    res.status(500).json({ error: 'Failed to search tutors' });
  }
};

/**
 * Returns the distinct list of module codes across all approved tutors.
 * Used to power the autocomplete dropdown on the search bar.
 * Cached in client memory; cheap query thanks to the GIN index.
 */
const getDistinctModuleCodes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT UPPER(code) AS code
      FROM tutor_profiles tp,
           unnest(tp.module_codes) AS code
      WHERE tp.approval_status = 'approved'
        AND code IS NOT NULL
        AND length(trim(code)) > 0
      ORDER BY code ASC
    `);

    res.json({
      moduleCodes: result.rows.map(r => r.code)
    });
  } catch (error) {
    console.error('Get module codes error:', error);
    res.status(500).json({ error: 'Failed to load module codes' });
  }
};

/**
 * Get single tutor by ID (public route).
 * IMPORTANT: phone_number and email stripped from public response.
 */
const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        tp.*,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      LEFT JOIN reviews r ON tp.id = r.tutor_id
      WHERE tp.id = $1 AND tp.approval_status = 'approved'
      GROUP BY tp.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ tutor: stripPrivateFields(result.rows[0]) });

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
  searchTutors,
  getDistinctModuleCodes,
  getTutorById
};
