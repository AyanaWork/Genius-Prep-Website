const pool = require('../config/database');

class Booking {
  // Create a new booking request
  static async create(bookingData) {
    const { studentId, tutorId, subject, message, preferredDate, preferredTime } = bookingData;
    
    const query = `
      INSERT INTO bookings (student_id, tutor_id, subject, message, preferred_date, preferred_time, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;
    
    const values = [studentId, tutorId, subject, message || null, preferredDate || null, preferredTime || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get booking by ID
  static async findById(bookingId) {
    const query = `
      SELECT 
        b.*,
        sp.display_name as student_name,
        sp.profile_picture_url as student_picture,
        tp.display_name as tutor_name,
        tp.profile_picture_url as tutor_picture,
        u1.email as student_email,
        u2.email as tutor_email
      FROM bookings b
      JOIN student_profiles sp ON b.student_id = sp.id
      JOIN tutor_profiles tp ON b.tutor_id = tp.id
      JOIN users u1 ON sp.user_id = u1.id
      JOIN users u2 ON tp.user_id = u2.id
      WHERE b.id = $1
    `;
    
    const result = await pool.query(query, [bookingId]);
    return result.rows[0];
  }

  // Get all bookings for a student
  static async findByStudentId(studentId) {
    const query = `
      SELECT 
        b.*,
        tp.display_name as tutor_name,
        tp.profile_picture_url as tutor_picture,
        tp.hourly_rate
      FROM bookings b
      JOIN tutor_profiles tp ON b.tutor_id = tp.id
      WHERE b.student_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  // Get all bookings for a tutor
  static async findByTutorId(tutorId) {
    const query = `
      SELECT 
        b.*,
        sp.display_name as student_name,
        sp.profile_picture_url as student_picture,
        sp.education_level
      FROM bookings b
      JOIN student_profiles sp ON b.student_id = sp.id
      WHERE b.tutor_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [tutorId]);
    return result.rows;
  }

  // Update booking status
  static async updateStatus(bookingId, status, tutorId = null) {
    let query;
    let values;
    
    if (tutorId) {
      // Verify the booking belongs to this tutor
      query = `
        UPDATE bookings 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND tutor_id = $3
        RETURNING *
      `;
      values = [status, bookingId, tutorId];
    } else {
      query = `
        UPDATE bookings 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      values = [status, bookingId];
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete/Cancel booking
  static async delete(bookingId, studentId) {
    const query = `
      DELETE FROM bookings 
      WHERE id = $1 AND student_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [bookingId, studentId]);
    return result.rows[0];
  }

  // Get booking statistics for a tutor
  static async getTutorStats(tutorId) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
        COUNT(*) as total_bookings
      FROM bookings
      WHERE tutor_id = $1
    `;
    
    const result = await pool.query(query, [tutorId]);
    return result.rows[0];
  }

  // Check if student has existing pending booking with tutor
  static async checkExistingPending(studentId, tutorId) {
    const query = `
      SELECT * FROM bookings 
      WHERE student_id = $1 AND tutor_id = $2 AND status = 'pending'
      LIMIT 1
    `;
    
    const result = await pool.query(query, [studentId, tutorId]);
    return result.rows[0];
  }
}

module.exports = Booking;