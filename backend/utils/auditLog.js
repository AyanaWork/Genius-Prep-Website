/**
 * Audit log helper
 * ----------------
 * Records sensitive admin actions to admin_audit_log so we have a paper
 * trail for who viewed phone numbers, who approved tutors, etc.
 *
 * Failures are swallowed (logged but never thrown) — auditing must
 * never break the parent operation. If the audit table is missing or
 * the insert fails, we log to the console and move on.
 */
const pool = require('../config/database');

async function logAdminAction({
  adminUserId,
  action,
  targetType = null,
  targetId = null,
  metadata = null,
  ipAddress = null
}) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_log
       (admin_user_id, action, target_type, target_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        adminUserId || null,
        action,
        targetType,
        targetId,
        metadata ? JSON.stringify(metadata) : null,
        ipAddress
      ]
    );
  } catch (err) {
    console.error('[auditLog] failed to record action:', action, err.message);
  }
}

module.exports = { logAdminAction };
