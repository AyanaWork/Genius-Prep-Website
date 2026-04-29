const pool = require('../config/database');

class TutorRequest {
  static async create(data) {
    const {
      requesterUserId = null,
      requesterType, fullName, email, phoneNumber,
      organisation, educationLevel, institution,
      subjects = [], moduleCodes = [], budgetPerHour,
      preferredFormat, location, numberOfStudents = 1, notes
    } = data;

    const query = `
      INSERT INTO tutor_requests
        (requester_user_id, requester_type, full_name, email, phone_number, organisation,
         education_level, institution, subjects, module_codes,
         budget_per_hour, preferred_format, location, number_of_students, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const values = [
      requesterUserId,
      requesterType, fullName, email, phoneNumber,
      organisation || null,
      educationLevel || null,
      institution || null,
      subjects, moduleCodes,
      budgetPerHour || null,
      preferredFormat || null,
      location || null,
      numberOfStudents,
      notes || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async list({ status, limit = 50, offset = 0 } = {}) {
    const params = [];
    let where = '';
    if (status) {
      params.push(status);
      where = 'WHERE status = $1';
    }
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM tutor_requests ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return result.rows;
  }

  /**
   * List requests submitted by a specific user — by user_id (logged-in
   * submission) OR by email match (for requests submitted while
   * logged-out, or under a different account).
   */
  static async listByUser({ userId, email }) {
    const result = await pool.query(
      `SELECT * FROM tutor_requests
       WHERE requester_user_id = $1
          OR LOWER(email) = LOWER($2)
       ORDER BY created_at DESC`,
      [userId, email || '']
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM tutor_requests WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(id, patch) {
    const allowed = ['status', 'admin_notes', 'matched_tutor_ids'];
    const sets = [];
    const params = [];
    let idx = 1;
    for (const key of allowed) {
      if (patch[key] !== undefined) {
        sets.push(`${key} = $${idx}`);
        params.push(patch[key]);
        idx++;
      }
    }
    if (sets.length === 0) return this.findById(id);
    sets.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    const result = await pool.query(
      `UPDATE tutor_requests SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0];
  }

  /**
   * Tutors that match a request (subject/module overlap, optional budget).
   */
  static async findMatchingTutors({ subjects = [], moduleCodes = [], budgetPerHour, limit = 10 }) {
    const conditions = [`tp.approval_status = 'approved'`];
    const params = [];
    let idx = 1;
    if (subjects.length > 0) {
      conditions.push(`tp.subjects && $${idx}`);
      params.push(subjects);
      idx++;
    }
    if (moduleCodes.length > 0) {
      conditions.push(`(
        SELECT bool_or(UPPER(m) = ANY(SELECT UPPER(c) FROM unnest($${idx}::text[]) c))
        FROM unnest(tp.module_codes) m
      )`);
      params.push(moduleCodes);
      idx++;
    }
    if (budgetPerHour) {
      conditions.push(`(tp.hourly_rate IS NULL OR tp.hourly_rate <= $${idx})`);
      params.push(budgetPerHour);
      idx++;
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limit);
    const limitIdx = idx;

    const result = await pool.query(
      `SELECT
         tp.id, tp.display_name, tp.subjects, tp.module_codes,
         tp.hourly_rate, tp.years_experience, tp.is_elite,
         tp.profile_picture_url, tp.bio,
         COALESCE(AVG(r.rating), 0) AS average_rating,
         COUNT(r.id) AS review_count
       FROM tutor_profiles tp
       LEFT JOIN reviews r ON tp.id = r.tutor_id
       ${whereClause}
       GROUP BY tp.id
       ORDER BY tp.is_elite DESC, average_rating DESC, tp.created_at DESC
       LIMIT $${limitIdx}`,
      params
    );
    return result.rows;
  }

  /**
   * Hydrate matched_tutor_ids into full tutor objects so the student
   * (and admin) can render the chosen tutors.
   */
  static async getTutorsByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const result = await pool.query(
      `SELECT
         tp.id, tp.display_name, tp.subjects, tp.module_codes,
         tp.hourly_rate, tp.years_experience, tp.is_elite,
         tp.profile_picture_url, tp.bio,
         COALESCE(AVG(r.rating), 0) AS average_rating,
         COUNT(r.id) AS review_count
       FROM tutor_profiles tp
       LEFT JOIN reviews r ON tp.id = r.tutor_id
       WHERE tp.id = ANY($1)
       GROUP BY tp.id`,
      [ids]
    );
    return result.rows;
  }
}

module.exports = TutorRequest;
