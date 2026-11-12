"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dashboard overview: summary metrics, search box, and quick activity feeds.
export default function Dashboard() {
  const [stats, setStats] = useState({
    companiesCount: 0,
    latestTrades: [],
    latestFilings: [],
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, tradeRes, filRes] = await Promise.all([
          fetch("/api/companies"),
          fetch("/api/insider-transactions"),
          fetch("/api/filings"),
        ]);

        if (compRes.status === 401) {
          router.push("/login");
          return;
        }

        const companies = compRes.ok ? await compRes.json() : [];
        const trades = tradeRes.ok ? await tradeRes.json() : [];
        const filings = filRes.ok ? await filRes.json() : [];

        setStats({
          companiesCount: Array.isArray(companies) ? companies.length : 0,
          latestTrades: Array.isArray(trades) ? trades.slice(0, 5) : [],
          latestFilings: Array.isArray(filings) ? filings.slice(0, 5) : [],
        });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/companies?search=${encodeURIComponent(search.trim())}`);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Market Intelligence Dashboard</h1>
      <p className="subtitle">Real-time overview of insider trades, SEC filings and tracked companies</p>

      {/* Quick Search */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 24, maxWidth: 500 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by company name or ticker (e.g. AAPL, Apple)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {/* 3 Summary Cards */}
      <div className="card-grid">
        <div className="card">
          <h3>Tracked Companies</h3>
          <p className="subtitle" style={{ margin: 0 }}>Active publicly-traded entities</p>
          <div className="card-number">{stats.companiesCount}</div>
        </div>

        <div className="card">
          <h3>Recent Insider Trades</h3>
          <p className="subtitle" style={{ margin: 0 }}>Latest Form 4 filings</p>
          <div className="card-number">{stats.latestTrades.length}</div>
        </div>

        <div className="card">
          <h3>NoSQL Filings Stored</h3>
          <p className="subtitle" style={{ margin: 0 }}>MongoDB raw SEC documents</p>
          <div className="card-number">{stats.latestFilings.length}</div>
        </div>
      </div>

      {/* Latest 5 Insider Transactions */}
      <h2>Latest 5 Insider Transactions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Ticker</th>
              <th>Company</th>
              <th>Insider</th>
              <th>Type</th>
              <th>Shares</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {stats.latestTrades.map((t) => (
              <tr key={t.transaction_id}>
                <td>{t.transaction_date?.slice(0, 10)}</td>
                <td>
                  <Link href={`/companies/${t.company_id}`}>
                    <strong>{t.ticker}</strong>
                  </Link>
                </td>
                <td>{t.company_name}</td>
                <td>{t.insider_name || "N/A"}</td>
                <td>
                  <span className={`badge ${t.transaction_code === "P" ? "badge-buy" : "badge-sell"}`}>
                    {t.transaction_code === "P" ? "BUY" : t.transaction_code === "S" ? "SELL" : t.transaction_code}
                  </span>
                </td>
                <td>{Number(t.shares_traded).toLocaleString()}</td>
                <td>${Number(t.price_per_share).toFixed(2)}</td>
                <td>${Number(t.total_value).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Latest 5 SEC Filings from MongoDB */}
      <h2>Latest 5 SEC Form 4 Filings (MongoDB)</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Accession Number</th>
              <th>Ticker</th>
              <th>Company</th>
              <th>Filing Date</th>
              <th>Status</th>
              <th>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {stats.latestFilings.map((f) => (
              <tr key={f.accession_number}>
                <td><code>{f.accession_number}</code></td>
                <td><strong>{f.issuer_ticker}</strong></td>
                <td>{f.issuer_name}</td>
                <td>{f.filing_date}</td>
                <td>
                  <span className={`badge ${f.parsed_status === "PARSED" ? "badge-parsed" : "badge-pending"}`}>
                    {f.parsed_status}
                  </span>
                </td>
                <td>
                  <Link href={`/filings/${f.accession_number}`} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
