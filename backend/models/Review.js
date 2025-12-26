const pool = require('../config/database');

class Review {
  // Create a new review
  static async create(reviewData) {
    const { tutorId, studentId, rating, reviewText } = reviewData;

    const query = `
      INSERT INTO reviews (tutor_id, student_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      tutorId,
      studentId,
      rating,
      reviewText
    ]);

    return result.rows[0];
  }

  // Get all reviews for a tutor
  static async findByTutorId(tutorId) {
    const query = `
      SELECT 
        r.*,
        sp.display_name as student_name,
        sp.profile_picture_url as student_picture
      FROM reviews r
      JOIN student_profiles sp ON r.student_id = sp.id
      WHERE r.tutor_id = $1 AND r.is_published = true
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [tutorId]);
    return result.rows;
  }

  // Get a specific review by ID
  static async findById(id) {
    const query = `
      SELECT 
        r.*,
        sp.display_name as student_name,
        sp.profile_picture_url as student_picture
      FROM reviews r
      JOIN student_profiles sp ON r.student_id = sp.id
      WHERE r.id = $1
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Check if student already reviewed this tutor
  static async checkExistingReview(tutorId, studentId) {
    const query = `
      SELECT * FROM reviews
      WHERE tutor_id = $1 AND student_id = $2
    `;

    const result = await pool.query(query, [tutorId, studentId]);
    return result.rows[0];
  }

  // Update a review
  static async update(reviewId, studentId, updateData) {
    const { rating, reviewText } = updateData;

    const query = `
      UPDATE reviews
      SET
        rating = COALESCE($1, rating),
        review_text = COALESCE($2, review_text),
        created_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND student_id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [
      rating,
      reviewText,
      reviewId,
      studentId
    ]);

    return result.rows[0];
  }

  // Delete a review
  static async delete(reviewId, studentId) {
    const query = `
      DELETE FROM reviews
      WHERE id = $1 AND student_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [reviewId, studentId]);
    return result.rows[0];
  }

  // Toggle review publication status (for moderation)
  static async togglePublished(reviewId) {
    const query = `
      UPDATE reviews
      SET is_published = NOT is_published
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [reviewId]);
    return result.rows[0];
  }

  // Get reviews by student (their reviews)
  static async findByStudentId(studentId) {
    const query = `
      SELECT 
        r.*,
        tp.display_name as tutor_name,
        tp.profile_picture_url as tutor_picture
      FROM reviews r
      JOIN tutor_profiles tp ON r.tutor_id = tp.id
      WHERE r.student_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  // Get average rating for a tutor
  static async getAverageRating(tutorId) {
    const query = `
      SELECT 
        COUNT(*) as review_count,
        COALESCE(AVG(rating), 0) as average_rating
      FROM reviews
      WHERE tutor_id = $1 AND is_published = true
    `;

    const result = await pool.query(query, [tutorId]);
    return result.rows[0];
  }
}

module.exports = Review;