import { pool } from "../config/mysql.js";

// Fetch latest 100 audit logs with optional user details.
export async function getAuditLogs() {
  const [rows] = await pool.query(
    `SELECT a.log_id,
            a.table_name,
            a.action_type,
            a.record_id,
            a.performed_by,
            u.username AS performed_by_user,
            a.action_timestamp,
            a.old_values,
            a.new_values
       FROM audit_logs a
  LEFT JOIN users u ON u.user_id = a.performed_by
      ORDER BY a.log_id DESC
      LIMIT 100`
  );
  return rows;
}
