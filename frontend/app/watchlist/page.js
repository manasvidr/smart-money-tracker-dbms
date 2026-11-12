"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Watchlist page: demonstrates the 3 DML operations (INSERT from company page, UPDATE note, DELETE item).
export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [feedback, setFeedback] = useState({});

  const loadWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      if (res.ok) {
        const data = await res.json();
        setWatchlist(data);
        // Initialize editable notes state
        const initialNotes = {};
        data.forEach((item) => {
          initialNotes[item.company_id] = item.notes || "";
        });
        setNotes(initialNotes);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  // DML 2: UPDATE note
  const handleUpdateNote = async (companyId) => {
    setFeedback((prev) => ({ ...prev, [companyId]: "Saving..." }));
    const res = await fetch("/api/watchlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        notes: notes[companyId],
      }),
    });

    if (res.ok) {
      setFeedback((prev) => ({ ...prev, [companyId]: "Saved!" }));
      setTimeout(() => {
        setFeedback((prev) => ({ ...prev, [companyId]: "" }));
      }, 2000);
    } else {
      setFeedback((prev) => ({ ...prev, [companyId]: "Error saving" }));
    }
  };

  // DML 3: DELETE company from watchlist
  const handleRemove = async (companyId) => {
    if (!confirm("Remove this company from your watchlist?")) return;

    const res = await fetch(`/api/watchlist?company_id=${companyId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setWatchlist((prev) => prev.filter((item) => item.company_id !== companyId));
    } else {
      alert("Failed to remove company");
    }
  };

  return (
    <div>
      <h1>My Watchlist</h1>
      <p className="subtitle">
        User portfolio watchlist — demonstrating MySQL DML Operations (SELECT, UPDATE, DELETE)
      </p>

      {loading ? (
        <p>Loading watchlist...</p>
      ) : watchlist.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: "1.1rem", marginBottom: 12 }}>Your watchlist is empty.</p>
          <Link href="/companies" className="btn btn-primary">
            Browse Companies to Add
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company Name</th>
                <th>Sector</th>
                <th>Added Date</th>
                <th>Notes (Editable - DML UPDATE)</th>
                <th>Actions (DML DELETE)</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => (
                <tr key={item.company_id}>
                  <td>
                    <Link href={`/companies/${item.company_id}`}>
                      <strong>{item.ticker}</strong>
                    </Link>
                  </td>
                  <td>{item.company_name}</td>
                  <td>{item.sector}</td>
                  <td>{item.added_at?.slice(0, 10)}</td>
                  <td style={{ minWidth: 260 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                        value={notes[item.company_id] ?? ""}
                        onChange={(e) =>
                          setNotes({ ...notes, [item.company_id]: e.target.value })
                        }
                      />
                      <button
                        onClick={() => handleUpdateNote(item.company_id)}
                        className="btn btn-secondary"
                        style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                      >
                        Save
                      </button>
                      {feedback[item.company_id] && (
                        <span style={{ fontSize: "0.8rem", color: "#166534" }}>
                          {feedback[item.company_id]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemove(item.company_id)}
                      className="btn btn-danger"
                      style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                    >
                      Remove
                    </button>
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
