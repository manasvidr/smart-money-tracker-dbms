"use client";

import { useEffect, useState } from "react";

// Admin audit log viewer: displays database triggers output stored in audit_logs.
export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then(async (res) => {
        if (res.status === 403 || res.status === 401) {
          setError("Access denied. This page is restricted to administrators only.");
          return [];
        }
        if (!res.ok) {
          setError("Failed to fetch audit logs.");
          return [];
        }
        return res.json();
      })
      .then((data) => setLogs(data))
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading audit trail...</p>;

  if (error) {
    return (
      <div className="card" style={{ maxWidth: 500, margin: "40px auto", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444", marginBottom: 12 }}>Access Denied</h2>
        <p className="subtitle">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Database Audit Trail</h1>
      <p className="subtitle">
        Automatically populated by MySQL database triggers (<code>trg_audit_insider_transactions</code>, etc.)
      </p>

      {logs.length === 0 ? (
        <div className="card">
          <p>No audit log entries recorded yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Table</th>
                <th>Action</th>
                <th>Record ID</th>
                <th>Timestamp</th>
                <th>Old Values (JSON)</th>
                <th>New Values (JSON)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.log_id}>
                  <td>#{log.log_id}</td>
                  <td><code>{log.table_name}</code></td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background:
                          log.action_type === "INSERT"
                            ? "#dcfce7"
                            : log.action_type === "UPDATE"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          log.action_type === "INSERT"
                            ? "#166534"
                            : log.action_type === "UPDATE"
                            ? "#92400e"
                            : "#991b1b",
                      }}
                    >
                      {log.action_type}
                    </span>
                  </td>
                  <td><code>{log.record_id}</code></td>
                  <td style={{ whiteSpace: "nowrap" }}>{log.action_timestamp?.slice(0, 19).replace("T", " ")}</td>
                  <td style={{ maxWidth: 300 }}>
                    {log.old_values ? (
                      <pre style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: 6, borderRadius: 4, overflow: "auto" }}>
                        {typeof log.old_values === "string" ? log.old_values : JSON.stringify(log.old_values, null, 2)}
                      </pre>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>NULL</span>
                    )}
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    {log.new_values ? (
                      <pre style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: 6, borderRadius: 4, overflow: "auto" }}>
                        {typeof log.new_values === "string" ? log.new_values : JSON.stringify(log.new_values, null, 2)}
                      </pre>
                    ) : (
                      <span style={{ color: "#94a3b8" }}>NULL</span>
                    )}
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
