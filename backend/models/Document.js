const pool = require('../config/database');

/**
 * Document model
 * --------------
 * Stores metadata about uploaded study materials (past papers, notes,
 * memos). The actual files live in Supabase storage; this table only
 * tracks references and moderation state.
 */
class Document {
  static async create(data) {
    const {
      uploaderUserId,
      docType,
      subject,
      moduleCode,
      institution,
      year,
      semester,
      title,
      description,
      storagePath,
      fileUrl,
      mimeType,
      fileSize
    } = data;

    const result = await pool.query(
      `INSERT INTO documents
        (uploader_user_id, doc_type, subject, module_code, institution,
         year, semester, title, description, storage_path, file_url,
         mime_type, file_size, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
       RETURNING *`,
      [
        uploaderUserId,
        docType,
        subject || null,
        moduleCode ? moduleCode.toUpperCase() : null,
        institution || null,
        year || null,
        semester || null,
        title,
        description || null,
        storagePath,
        fileUrl,
        mimeType || null,
        fileSize || null
      ]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Number of APPROVED uploads by this user. Used to gate access.
   */
  static async approvedUploadCountByUser(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM documents
       WHERE uploader_user_id = $1 AND status = 'approved'`,
      [userId]
    );
    return result.rows[0]?.n || 0;
  }

  /**
   * Total uploads by this user (any status). Used for friendlier UX
   * messages like "Your upload is awaiting review".
   */
  static async totalUploadCountByUser(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS n
       FROM documents WHERE uploader_user_id = $1`,
      [userId]
    );
    return result.rows[0]?.n || 0;
  }

  /**
   * Public list — only approved docs. Supports filtering, search,
   * pagination. Mirrors the BrowseTutors search shape.
   */
  static async listApproved({
    docType,
    subject,
    moduleCode,
    q,
    sort = 'newest',
    page = 1,
    limit = 24
  } = {}) {
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;

    const where = [`status = 'approved'`];
    const params = [];
    let i = 1;

    if (docType) { where.push(`doc_type = $${i}`); params.push(docType); i++; }
    if (subject) { where.push(`subject = $${i}`); params.push(subject); i++; }
    if (moduleCode) {
      where.push(`UPPER(module_code) = UPPER($${i})`);
      params.push(moduleCode);
      i++;
    }
    if (q && q.trim()) {
      where.push(`(
        title ILIKE $${i}
        OR description ILIKE $${i}
        OR module_code ILIKE $${i}
        OR subject ILIKE $${i}
      )`);
      params.push(`%${q.trim()}%`);
      i++;
    }

    const whereSql = where.join(' AND ');

    const sortClauses = {
      newest: 'ORDER BY created_at DESC',
      popular: 'ORDER BY view_count DESC, created_at DESC',
      year_desc: 'ORDER BY year DESC NULLS LAST, created_at DESC'
    };
    const orderBy = sortClauses[sort] || sortClauses.newest;

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM documents WHERE ${whereSql}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    params.push(safeLimit, offset);
    const result = await pool.query(
      `SELECT id, uploader_user_id, doc_type, subject, module_code,
              institution, year, semester, title, description,
              file_url, mime_type, file_size, view_count, created_at
       FROM documents
       WHERE ${whereSql}
       ${orderBy}
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );

    return {
      documents: result.rows,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit)
    };
  }

  static async listByUploader(uploaderUserId) {
    const result = await pool.query(
      `SELECT * FROM documents
       WHERE uploader_user_id = $1
       ORDER BY created_at DESC`,
      [uploaderUserId]
    );
    return result.rows;
  }

  /**
   * Distinct module codes across approved documents (for autocomplete).
   */
  static async distinctModuleCodes() {
    const result = await pool.query(`
      SELECT DISTINCT UPPER(module_code) AS code
      FROM documents
      WHERE status = 'approved'
        AND module_code IS NOT NULL
        AND length(trim(module_code)) > 0
      ORDER BY code ASC
    `);
    return result.rows.map(r => r.code);
  }

  static async incrementViewCount(id) {
    await pool.query('UPDATE documents SET view_count = view_count + 1 WHERE id = $1', [id]);
  }

  // ---- Admin moderation -----------------------------------------------
  static async listForModeration(status = 'pending') {
    const result = await pool.query(
      `SELECT d.*, u.email AS uploader_email
       FROM documents d
       LEFT JOIN users u ON d.uploader_user_id = u.id
       WHERE d.status = $1
       ORDER BY d.created_at DESC`,
      [status]
    );
    return result.rows;
  }

  static async setStatus(id, status, { moderatorUserId, rejectionReason } = {}) {
    const result = await pool.query(
      `UPDATE documents
       SET status = $1,
           rejection_reason = $2,
           moderated_by = $3,
           moderated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, rejectionReason || null, moderatorUserId || null, id]
    );
    return result.rows[0];
  }

  static async deleteById(id) {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 RETURNING storage_path',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Document;
