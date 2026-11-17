import { filingsCollection } from "../config/mongo.js";
import { pool } from "../config/mysql.js";

// Fetch filings from MongoDB (excluding heavy raw_xml) with optional ticker filter.
export async function getFilings(ticker) {
  const col = await filingsCollection();
  const query = ticker ? { issuer_ticker: ticker.toUpperCase() } : {};
  const cursor = col
    .find(query, { projection: { raw_xml: 0 } })
    .sort({ filing_date: -1 });
  const docs = await cursor.toArray();
  // Map _id to string for JSON serialization
  return docs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  }));
}

// Fetch single filing combining MongoDB document with MySQL metadata.
export async function getFilingByAccession(accession) {
  const col = await filingsCollection();
  const mongoDoc = await col.findOne({ accession_number: accession });
  if (!mongoDoc) return null;

  // Retrieve MySQL row matching accession_number
  const [mysqlRows] = await pool.query(
    `SELECT f.filing_id, f.company_id, f.accession_number, f.filing_date, f.report_period,
            c.ticker, c.company_name, c.cik
       FROM sec_filings f
       JOIN companies c ON c.company_id = f.company_id
      WHERE f.accession_number = ?`,
    [accession]
  );

  return {
    mongo: {
      ...mongoDoc,
      _id: mongoDoc._id.toString(),
    },
    mysql: mysqlRows[0] || null,
  };
}

// Update the parsed_status of a filing in MongoDB (Admin action).
export async function updateFilingStatus(accession, parsedStatus) {
  const col = await filingsCollection();
  const result = await col.updateOne(
    { accession_number: accession },
    { $set: { parsed_status: parsedStatus } }
  );
  return result.modifiedCount;
}

// Delete a filing from MongoDB by accession number (Admin action).
export async function deleteFiling(accession) {
  const col = await filingsCollection();
  const result = await col.deleteOne({ accession_number: accession });
  return result.deletedCount;
}
