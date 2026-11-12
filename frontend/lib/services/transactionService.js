import { pool } from "../config/mysql.js";

// Fetch latest 50 insider transactions with company ticker and insider info.
export async function getInsiderTransactions() {
  const [rows] = await pool.query(
    `SELECT t.transaction_id,
            c.company_id,
            c.ticker,
            c.company_name,
            i.full_name AS insider_name,
            r.title AS insider_role,
            t.transaction_date,
            t.transaction_code,
            t.shares_traded,
            t.price_per_share,
            t.total_value
       FROM insider_transactions t
       JOIN companies c ON c.company_id = t.company_id
  LEFT JOIN transaction_owners o ON o.transaction_id = t.transaction_id AND o.company_id = t.company_id
  LEFT JOIN company_insider_roles r ON r.role_assignment_id = o.role_assignment_id AND r.company_id = t.company_id
  LEFT JOIN insiders i ON i.insider_id = r.insider_id
      ORDER BY t.transaction_date DESC, t.transaction_id DESC
      LIMIT 50`
  );
  return rows;
}
