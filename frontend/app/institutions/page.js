"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Institutional ownership table (Form 13F holdings).
export default function InstitutionsPage() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/institutional-holdings")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHoldings(data))
      .catch((err) => console.error("Error loading holdings:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Institutional Ownership Overview</h1>
      <p className="subtitle">
        Quarterly holdings and portfolio weights from institutional 13F filings
      </p>

      {loading ? (
        <p>Loading institutional holdings...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Institution</th>
                <th>Manager</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Report Date</th>
                <th>Shares Held</th>
                <th>Market Value</th>
                <th>Portfolio %</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i}>
                  <td><strong>{h.institution_name}</strong></td>
                  <td>{h.manager_name || "N/A"}</td>
                  <td>
                    <Link href={`/companies/${h.company_id}`}>
                      <strong>{h.ticker}</strong>
                    </Link>
                  </td>
                  <td>{h.company_name}</td>
                  <td>{h.report_date?.slice(0, 10)}</td>
                  <td>{Number(h.shares_held).toLocaleString()}</td>
                  <td>${Number(h.market_value).toLocaleString()}</td>
                  <td>{h.percentage_held ? `${h.percentage_held}%` : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
