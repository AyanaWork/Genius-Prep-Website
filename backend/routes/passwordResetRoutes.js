const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    const user = userResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) 
       DO UPDATE SET token_hash = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP`,
      [user.id, resetTokenHash, resetTokenExpiry]
    );

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Email content
    const mailOptions = {
      from: `"Genius Prep Tuition" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Genius Prep Tuition',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password for your Genius Prep Tuition account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <div class="warning">
                <strong>?? Important:</strong>
                <ul>
                  <li>This link will expire in 1 hour</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #4A90E2;">${resetUrl}</p>
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
              <p>Best regards,<br><strong>Genius Prep Tuition Team</strong></p>
            </div>
            <div class="footer">
              <p>(c) 2026 Genius Prep Tuition. All rights reserved.</p>
              <p>?? hello@geniuspreptuition.co.za | ?? 071 961 7185</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', email);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success to user for security
    }

    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Hash the provided token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user and verify token
    const result = await pool.query(
      `SELECT u.id, u.email, prt.expires_at
       FROM users u
       INNER JOIN password_reset_tokens prt ON u.id = prt.user_id
       WHERE u.email = $1 AND prt.token_hash = $2`,
      [email.toLowerCase(), tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];

    // Check if token has expired
    if (new Date() > new Date(user.expires_at)) {
      // Delete expired token
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, user.id]
    );

    // Delete used token
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Send confirmation email
    const confirmationEmail = {
      from: `"Genius Prep Tuition" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Successful - Genius Prep Tuition',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>? Password Reset Successful</h1>
            </div>
            <div class="content">
              <div class="success">
                <strong>Your password has been successfully reset!</strong>
              </div>
              <p>Hello,</p>
              <p>This email confirms that your Genius Prep Tuition account password has been changed.</p>
              <p>You can now log in with your new password.</p>
              <p><strong>If you didn't make this change,</strong> please contact us immediately at hello@geniuspreptuition.co.za</p>
              <p>Best regards,<br><strong>Genius Prep Tuition Team</strong></p>
            </div>
            <div class="footer">
              <p>(c) 2026 Genius Prep Tuition. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(confirmationEmail);
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify reset token (optional - for checking if token is valid before showing reset form)
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT prt.expires_at
       FROM users u
       INNER JOIN password_reset_tokens prt ON u.id = prt.user_id
       WHERE u.email = $1 AND prt.token_hash = $2`,
      [email.toLowerCase(), tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ valid: false, error: 'Invalid reset token' });
    }

    const expiresAt = new Date(result.rows[0].expires_at);
    
    if (new Date() > expiresAt) {
      return res.status(400).json({ valid: false, error: 'Reset token has expired' });
    }

    res.json({ valid: true, expiresAt });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

module.exports = router;
