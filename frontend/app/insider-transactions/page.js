"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Insider transactions ledger with role and trade details, plus admin trigger action.
export default function InsiderTransactionsPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newShares, setNewShares] = useState("");
  const [triggerMsg, setTriggerMsg] = useState("");

  const loadTrades = async () => {
    try {
      const res = await fetch("/api/insider-transactions");
      if (res.ok) {
        const data = await res.json();
        setTrades(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setCurrentUser(u));
    loadTrades();
  }, []);

  const isAdmin = currentUser?.roles?.includes("ADMIN");

  const handleUpdateShares = async (transactionId) => {
    if (!newShares || isNaN(newShares)) return;
    setTriggerMsg("");

    const res = await fetch("/api/insider-transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transaction_id: transactionId,
        shares_traded: Number(newShares),
      }),
    });

    if (res.ok) {
      setTriggerMsg(`Transaction #${transactionId} updated! AFTER UPDATE trigger fired into audit_logs.`);
      setEditingId(null);
      setNewShares("");
      loadTrades();
    } else {
      const err = await res.json();
      setTriggerMsg(err.error || "Update failed");
    }
  };

  return (
    <div>
      <h1>Insider Transactions Ledger</h1>
      <p className="subtitle">
        Latest SEC Form 4 insider trading activity across tracked entities (multi-table JOIN)
      </p>

      {triggerMsg && (
        <div className="alert-success" style={{ marginBottom: 16 }}>
          {triggerMsg}
        </div>
      )}

      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Insider Name</th>
                <th>Position</th>
                <th>Action</th>
                <th>Shares Traded</th>
                <th>Price</th>
                <th>Total Value</th>
                {isAdmin && <th>Admin Action (Audit Trigger)</th>}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.transaction_id}>
                  <td>{t.transaction_date?.slice(0, 10)}</td>
                  <td>
                    <Link href={`/companies/${t.company_id}`}>
                      <strong>{t.ticker}</strong>
                    </Link>
                  </td>
                  <td>{t.company_name}</td>
                  <td><strong>{t.insider_name || "N/A"}</strong></td>
                  <td>{t.insider_role || "N/A"}</td>
                  <td>
                    <span className={`badge ${t.transaction_code === "P" ? "badge-buy" : "badge-sell"}`}>
                      {t.transaction_code === "P" ? "BUY (P)" : t.transaction_code === "S" ? "SELL (S)" : t.transaction_code}
                    </span>
                  </td>
                  <td>
                    {editingId === t.transaction_id ? (
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: 100, padding: 4 }}
                        value={newShares}
                        onChange={(e) => setNewShares(e.target.value)}
                      />
                    ) : (
                      Number(t.shares_traded).toLocaleString()
                    )}
                  </td>
                  <td>${Number(t.price_per_share).toFixed(2)}</td>
                  <td>${Number(t.total_value).toLocaleString()}</td>
                  {isAdmin && (
                    <td>
                      {editingId === t.transaction_id ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => handleUpdateShares(t.transaction_id)}
                            className="btn btn-success"
                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                          >
                            Save & Fire Trigger
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="btn btn-secondary"
                            style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(t.transaction_id);
                            setNewShares(t.shares_traded);
                          }}
                          className="btn btn-secondary"
                          style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                        >
                          Edit Shares
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
