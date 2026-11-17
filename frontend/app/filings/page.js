"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// SEC Filings list page (fed from MongoDB collection raw_sec_filings).
export default function FilingsPage() {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState("");

  const loadFilings = async (filterTicker) => {
    setLoading(true);
    try {
      const url = filterTicker ? `/api/filings?ticker=${encodeURIComponent(filterTicker)}` : "/api/filings";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setFilings(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilings("");
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadFilings(ticker.trim());
  };

  return (
    <div>
      <h1>SEC Form 4 Filings (MongoDB)</h1>
      <p className="subtitle">
        Unstructured and semi-structured documents stored in NoSQL <code>raw_sec_filings</code> collection
      </p>

      <form onSubmit={handleFilter} style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 400 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Filter by ticker (e.g. AAPL)..."
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
        {ticker && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setTicker("");
              loadFilings("");
            }}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading filings from MongoDB...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Accession Number (Key)</th>
                <th>Ticker</th>
                <th>Company Name</th>
                <th>CIK</th>
                <th>Filing Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filings.map((f) => (
                <tr key={f.accession_number}>
                  <td><code>{f.accession_number}</code></td>
                  <td><strong>{f.issuer_ticker}</strong></td>
                  <td>{f.issuer_name}</td>
                  <td>{f.issuer_cik}</td>
                  <td>{f.filing_date}</td>
                  <td>
                    <span className={`badge ${f.parsed_status === "PARSED" ? "badge-parsed" : "badge-pending"}`}>
                      {f.parsed_status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/filings/${f.accession_number}`}
                      className="btn btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    >
                      Inspect Document
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
