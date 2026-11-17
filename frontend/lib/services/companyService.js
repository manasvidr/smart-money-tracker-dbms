import { pool } from "../config/mysql.js";

// Fetch companies list with optional search query.
export async function getCompanies(search) {
  let query = "SELECT company_id, cik, ticker, company_name, sector, industry FROM companies";
  const params = [];
  if (search) {
    query += " WHERE company_name LIKE ? OR ticker LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }
  query += " ORDER BY ticker ASC";
  const [rows] = await pool.query(query, params);
  return rows;
}

// Fetch complete company detail including prices, trades, holdings, and stored function signal.
export async function getCompanyById(id) {
  // 1. Company details
  const [companies] = await pool.query(
    "SELECT company_id, cik, ticker, company_name, sector, industry FROM companies WHERE company_id = ?",
    [id]
  );
  if (companies.length === 0) return null;
  const company = companies[0];

  // 2. Latest 30 daily prices
  const [prices] = await pool.query(
    `SELECT price_date, open_price, high_price, low_price, close_price, adj_close, volume
       FROM daily_prices
      WHERE company_id = ?
      ORDER BY price_date DESC
      LIMIT 30`,
    [id]
  );

  // 3. Insider transactions joined with SEC filings
  const [transactions] = await pool.query(
    `SELECT t.transaction_id, t.transaction_date, t.transaction_code,
            t.shares_traded, t.price_per_share, t.total_value,
            f.accession_number
       FROM insider_transactions t
       JOIN sec_filings f ON f.filing_id = t.filing_id
      WHERE t.company_id = ?
      ORDER BY t.transaction_date DESC`,
    [id]
  );

  // 4. Institutional holdings joined with institutions
  const [holdings] = await pool.query(
    `SELECT h.report_date, i.institution_name, i.manager_name,
            h.shares_held, h.market_value, h.percentage_held
       FROM institutional_holdings h
       JOIN institutions i ON i.institution_id = h.institution_id
      WHERE h.company_id = ?
      ORDER BY h.report_date DESC, h.market_value DESC`,
    [id]
  );

  // 5. Signal: Stored function fn_calculate_return over 30-day price window
  let signal = null;
  if (prices.length >= 2) {
    const latestClose = prices[0].close_price;
    const baseClose = prices[prices.length - 1].close_price;
    const [sigRows] = await pool.query(
      "SELECT fn_calculate_return(?, ?) AS signal_value",
      [baseClose, latestClose]
    );
    signal = sigRows[0]?.signal_value ?? null;
  }

  return {
    ...company,
    prices,
    transactions,
    holdings,
    signal,
  };
}
