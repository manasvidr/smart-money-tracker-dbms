"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

// Company details view: metadata, stored function return signal, historical prices, trades, holdings, and watchlist button.
export default function CompanyDetailPage({ params }) {
  const unwrappedParams = use(params);
  const companyId = unwrappedParams.id;

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlistNote, setWatchlistNote] = useState("");
  const [watchlistMsg, setWatchlistMsg] = useState({ text: "", type: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${companyId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCompany(data))
      .catch((err) => console.error("Error loading company:", err))
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleAddToWatchlist = async () => {
    setAdding(true);
    setWatchlistMsg({ text: "", type: "" });
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: Number(companyId),
          notes: watchlistNote || "Added from company page",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWatchlistMsg({ text: "Added to your watchlist!", type: "success" });
      } else {
        setWatchlistMsg({ text: data.error || "Failed to add", type: "error" });
      }
    } catch {
      setWatchlistMsg({ text: "Network error", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <p>Loading company details...</p>;
  if (!company) return <p>Company not found.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>{company.company_name} ({company.ticker})</h1>
          <p className="subtitle">
            Sector: <strong>{company.sector}</strong> | Industry: <strong>{company.industry}</strong> | CIK: <strong>{company.cik}</strong>
          </p>
        </div>

        {/* Add to Watchlist (DML 1 Trigger) */}
        <div style={{ background: "white", padding: 16, border: "1px solid #e2e8f0", borderRadius: 8, minWidth: 280 }}>
          <h4 style={{ marginBottom: 8 }}>Track in Watchlist</h4>
          {watchlistMsg.text && (
            <div className={watchlistMsg.type === "success" ? "alert-success" : "alert-error"} style={{ padding: "6px 10px", fontSize: "0.85rem" }}>
              {watchlistMsg.text}
            </div>
          )}
          <input
            type="text"
            className="form-input"
            placeholder="Add note (optional)..."
            value={watchlistNote}
            onChange={(e) => setWatchlistNote(e.target.value)}
            style={{ marginBottom: 8, fontSize: "0.85rem" }}
          />
          <button
            onClick={handleAddToWatchlist}
            disabled={adding}
            className="btn btn-primary"
            style={{ width: "100%", fontSize: "0.85rem" }}
          >
            {adding ? "Adding..." : "+ Add to Watchlist"}
          </button>
        </div>
      </div>

      {/* Stored Function: Signal Value */}
      <div className="signal-box">
        <div>
          <h3>Computed Financial Signal (MySQL Stored Function)</h3>
          <p style={{ fontSize: "0.9rem", color: "#475569", margin: "4px 0" }}>
            Calculated via stored function <code>fn_calculate_return(base_price, latest_price)</code> using 30-day closing prices:
          </p>
        </div>
        <div className="signal-value">
          {company.signal !== null ? `${Number(company.signal) > 0 ? "+" : ""}${company.signal}%` : "N/A"}
        </div>
      </div>

      {/* Latest 30 Daily Prices */}
      <h2>Historical Daily Prices (Last 30 Trading Days)</h2>
      <div className="table-wrap" style={{ maxHeight: 320 }}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Adj Close</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {company.prices?.map((p) => (
              <tr key={p.price_date}>
                <td>{p.price_date?.slice(0, 10)}</td>
                <td>${Number(p.open_price).toFixed(2)}</td>
                <td>${Number(p.high_price).toFixed(2)}</td>
                <td>${Number(p.low_price).toFixed(2)}</td>
                <td><strong>${Number(p.close_price).toFixed(2)}</strong></td>
                <td>${Number(p.adj_close).toFixed(2)}</td>
                <td>{Number(p.volume).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insider Transactions for this Company */}
      <h2>Insider Transactions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Shares Traded</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>SEC Accession</th>
            </tr>
          </thead>
          <tbody>
            {company.transactions?.map((t) => (
              <tr key={t.transaction_id}>
                <td>#{t.transaction_id}</td>
                <td>{t.transaction_date?.slice(0, 10)}</td>
                <td>
                  <span className={`badge ${t.transaction_code === "P" ? "badge-buy" : "badge-sell"}`}>
                    {t.transaction_code === "P" ? "BUY" : "SELL"}
                  </span>
                </td>
                <td>{Number(t.shares_traded).toLocaleString()}</td>
                <td>${Number(t.price_per_share).toFixed(2)}</td>
                <td>${Number(t.total_value).toLocaleString()}</td>
                <td>
                  <Link href={`/filings/${t.accession_number}`}>
                    <code>{t.accession_number}</code>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Institutional Holdings for this Company */}
      <h2>Institutional Holdings (Form 13F)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Institution</th>
              <th>Manager</th>
              <th>Report Date</th>
              <th>Shares Held</th>
              <th>Market Value</th>
              <th>% of Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {company.holdings?.map((h, i) => (
              <tr key={i}>
                <td><strong>{h.institution_name}</strong></td>
                <td>{h.manager_name || "N/A"}</td>
                <td>{h.report_date?.slice(0, 10)}</td>
                <td>{Number(h.shares_held).toLocaleString()}</td>
                <td>${Number(h.market_value).toLocaleString()}</td>
                <td>{h.percentage_held ? `${h.percentage_held}%` : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
