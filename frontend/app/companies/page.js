"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Companies directory with search filter.
export default function CompaniesPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async (query) => {
    setLoading(true);
    try {
      const url = query ? `/api/companies?search=${encodeURIComponent(query)}` : "/api/companies";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(initialSearch);
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(search);
  };

  return (
    <div>
      <h1>Public Companies</h1>
      <p className="subtitle">Tracked entities in the relational database</p>

      <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, marginBottom: 20, maxWidth: 500 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by company or ticker..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Filter
        </button>
        {search && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSearch("");
              fetchCompanies("");
            }}
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company Name</th>
                <th>CIK</th>
                <th>Sector</th>
                <th>Industry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.company_id}>
                  <td><strong>{c.ticker}</strong></td>
                  <td>{c.company_name}</td>
                  <td>{c.cik}</td>
                  <td>{c.sector}</td>
                  <td>{c.industry}</td>
                  <td>
                    <Link href={`/companies/${c.company_id}`} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                      View Details
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
