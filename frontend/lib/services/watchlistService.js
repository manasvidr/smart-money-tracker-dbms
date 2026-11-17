import { pool } from "../config/mysql.js";

// SELECT: the user's watchlist with company details (JOIN).
export async function getWatchlist(userId) {
  const [rows] = await pool.query(
    `SELECT w.company_id, c.ticker, c.company_name, c.sector, w.added_at, w.notes
       FROM user_watchlist w
       JOIN companies c ON c.company_id = w.company_id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC`,
    [userId]
  );
  return rows;
}

// DML 1: INSERT a company into the watchlist.
export async function addToWatchlist(userId, companyId, notes) {
  await pool.query(
    "INSERT INTO user_watchlist (user_id, company_id, notes) VALUES (?, ?, ?)",
    [userId, companyId, notes || null]
  );
}

// DML 2: UPDATE the note on a watchlist entry.
export async function updateNote(userId, companyId, notes) {
  const [res] = await pool.query(
    "UPDATE user_watchlist SET notes = ? WHERE user_id = ? AND company_id = ?",
    [notes, userId, companyId]
  );
  return res.affectedRows;
}

// DML 3: DELETE a company from the watchlist.
export async function removeFromWatchlist(userId, companyId) {
  const [res] = await pool.query(
    "DELETE FROM user_watchlist WHERE user_id = ? AND company_id = ?",
    [userId, companyId]
  );
  return res.affectedRows;
}
