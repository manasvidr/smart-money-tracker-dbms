import { pool } from "../config/mysql.js";

// Fetch latest institutional holdings with institution and company details.
export async function getInstitutionalHoldings() {
  const [rows] = await pool.query(
    `SELECT h.institution_id,
            i.institution_name,
            i.manager_name,
            c.company_id,
            c.ticker,
            c.company_name,
            h.report_date,
            h.shares_held,
            h.market_value,
            h.percentage_held
       FROM institutional_holdings h
       JOIN institutions i ON i.institution_id = h.institution_id
       JOIN companies c ON c.company_id = h.company_id
      ORDER BY h.report_date DESC, h.market_value DESC`
  );
  return rows;
}
