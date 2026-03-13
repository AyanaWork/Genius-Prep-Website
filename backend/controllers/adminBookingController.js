const pool = require('../config/database');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Get all bookings for admin view
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search, sortBy = 'created_at', order = 'DESC' } = req.query;

    let query = `
      SELECT 
        b.*,
        tp.display_name as tutor_name,
        tp.hourly_rate,
        sp.display_name as student_name,
        u_student.email as student_email,
        u_tutor.email as tutor_email,
        u_tutor.id as tutor_user_id,
        EXTRACT(EPOCH FROM (NOW() - b.created_at))/3600 as hours_pending
      FROM bookings b
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.id
      LEFT JOIN student_profiles sp ON b.student_id = sp.id
      LEFT JOIN users u_student ON sp.user_id = u_student.id
      LEFT JOIN users u_tutor ON tp.user_id = u_tutor.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filter by status
    if (status && status !== 'all') {
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Search by student name, tutor name, or subject
    if (search) {
      query += ` AND (
        LOWER(tp.display_name) LIKE $${paramCount} OR 
        LOWER(sp.display_name) LIKE $${paramCount} OR 
        LOWER(b.subject) LIKE $${paramCount}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    // Sort
    const validSortColumns = ['created_at', 'date', 'status', 'subject'];
    const validOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    
    query += ` ORDER BY b.${sortColumn} ${sortOrder}`;

    const result = await pool.query(query, params);

    // Calculate some stats
    const stats = {
      total: result.rows.length,
      pending: result.rows.filter(b => b.status === 'pending').length,
      accepted: result.rows.filter(b => b.status === 'accepted').length,
      declined: result.rows.filter(b => b.status === 'declined').length,
      completed: result.rows.filter(b => b.status === 'completed').length,
      oldPending: result.rows.filter(b => b.status === 'pending' && b.hours_pending > 24).length
    };

    res.json({
      success: true,
      bookings: result.rows,
      stats
    });

  } catch (error) {
    console.error('❌ Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Admin accepts booking on behalf of tutor
exports.acceptBookingAsAdmin = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const adminUserId = req.userId;

    // Get booking details
    const bookingResult = await pool.query(`
      SELECT 
        b.*,
        tp.display_name as tutor_name,
        sp.display_name as student_name,
        u_student.email as student_email,
        u_tutor.email as tutor_email,
        u_tutor.id as tutor_user_id
      FROM bookings b
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.id
      LEFT JOIN student_profiles sp ON b.student_id = sp.id
      LEFT JOIN users u_student ON sp.user_id = u_student.id
      LEFT JOIN users u_tutor ON tp.user_id = u_tutor.id
      WHERE b.id = $1
    `, [bookingId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be accepted' });
    }

    // Update booking status
    await pool.query(`
      UPDATE bookings 
      SET status = 'accepted', 
          accepted_by_admin = true,
          admin_action_date = NOW()
      WHERE id = $1
    `, [bookingId]);

    // Send email to student
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.student_email,
      subject: 'Booking Confirmed - Genius Prep Tuition',
      html: `
        <h2>Your Booking Has Been Confirmed!</h2>
        <p>Hi ${booking.student_name},</p>
        <p>Good news! Your booking request has been confirmed by our admin team.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Tutor:</strong> ${booking.tutor_name}</li>
          <li><strong>Subject:</strong> ${booking.subject}</li>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Duration:</strong> ${booking.number_of_hours || 3} hours</li>
        </ul>
        
        <p>Your tutor will contact you shortly to finalize session details.</p>
        
        <p>Best regards,<br>Genius Prep Team</p>
      `
    });

    // Send email to tutor
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.tutor_email,
      subject: 'Booking Accepted by Admin - Action Required',
      html: `
        <h2>Booking Accepted on Your Behalf</h2>
        <p>Hi ${booking.tutor_name},</p>
        <p>Our admin team has accepted a booking request on your behalf. Please review and contact the student.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Student:</strong> ${booking.student_name}</li>
          <li><strong>Subject:</strong> ${booking.subject}</li>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
          <li><strong>Duration:</strong> ${booking.number_of_hours || 3} hours</li>
        </ul>
        
        <p><strong>Student Email:</strong> ${booking.student_email}</p>
        
        <p>Please reach out to the student to confirm session details.</p>
        
        <p>Best regards,<br>Genius Prep Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Booking accepted successfully. Emails sent to student and tutor.'
    });

  } catch (error) {
    console.error('❌ Admin accept booking error:', error);
    res.status(500).json({ error: 'Failed to accept booking' });
  }
};

// Admin declines booking on behalf of tutor
exports.declineBookingAsAdmin = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const adminUserId = req.userId;

    if (!reason) {
      return res.status(400).json({ error: 'Decline reason is required' });
    }

    // Get booking details
    const bookingResult = await pool.query(`
      SELECT 
        b.*,
        tp.display_name as tutor_name,
        sp.display_name as student_name,
        u_student.email as student_email,
        u_tutor.email as tutor_email
      FROM bookings b
      LEFT JOIN tutor_profiles tp ON b.tutor_id = tp.id
      LEFT JOIN student_profiles sp ON b.student_id = sp.id
      LEFT JOIN users u_student ON sp.user_id = u_student.id
      LEFT JOIN users u_tutor ON tp.user_id = u_tutor.id
      WHERE b.id = $1
    `, [bookingId]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be declined' });
    }

    // Update booking status
    await pool.query(`
      UPDATE bookings 
      SET status = 'declined',
          decline_reason = $1,
          declined_by_admin = true,
          admin_action_date = NOW()
      WHERE id = $2
    `, [reason, bookingId]);

    // Send email to student
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.student_email,
      subject: 'Booking Update - Genius Prep Tuition',
      html: `
        <h2>Booking Status Update</h2>
        <p>Hi ${booking.student_name},</p>
        <p>Unfortunately, your booking request could not be confirmed at this time.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Tutor:</strong> ${booking.tutor_name}</li>
          <li><strong>Subject:</strong> ${booking.subject}</li>
          <li><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${booking.time}</li>
        </ul>
        
        <p><strong>Reason:</strong> ${reason}</p>
        
        <p>Please feel free to browse other available tutors or try booking a different time slot.</p>
        
        <p>Best regards,<br>Genius Prep Team</p>
      `
    });

    res.json({
      success: true,
      message: 'Booking declined. Email sent to student.'
    });

  } catch (error) {
    console.error('❌ Admin decline booking error:', error);
    res.status(500).json({ error: 'Failed to decline booking' });
  }
};

// Get booking statistics for admin dashboard
exports.getBookingStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours') as old_pending_count,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
      FROM bookings
    `);

    res.json({
      success: true,
      stats: stats.rows[0]
    });

  } catch (error) {
    console.error('❌ Get booking stats error:', error);
    res.status(500).json({ error: 'Failed to fetch booking statistics' });
  }
};

// Get tutor contact information
exports.getTutorContact = async (req, res) => {
  try {
    const { tutorId } = req.params;

    const result = await pool.query(`
      SELECT 
        tp.display_name,
        u.email,
        tp.phone
      FROM tutor_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = $1
    `, [tutorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({
      success: true,
      contact: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Get tutor contact error:', error);
    res.status(500).json({ error: 'Failed to fetch tutor contact' });
  }
};

module.exports = exports;