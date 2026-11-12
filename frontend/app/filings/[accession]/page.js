"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// SEC Filing Inspector: compares MongoDB raw XML & parsed JSON against MySQL relational row.
export default function FilingInspectorPage({ params }) {
  const unwrappedParams = use(params);
  const accession = unwrappedParams.accession;

  const [data, setData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const router = useRouter();

  const loadFiling = async () => {
    try {
      const res = await fetch(`/api/filings/${accession}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setCurrentUser(u));
    loadFiling();
  }, [accession]);

  const isAdmin = currentUser?.roles?.includes("ADMIN");

  // Admin action: Mark as PARSED (PATCH)
  const handleMarkParsed = async () => {
    setActionMsg("");
    const res = await fetch(`/api/filings/${accession}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parsed_status: "PARSED" }),
    });
    if (res.ok) {
      setActionMsg("Status updated to PARSED in MongoDB.");
      loadFiling();
    } else {
      setActionMsg("Failed to update status.");
    }
  };

  // Admin action: Delete document (DELETE)
  const handleDelete = async () => {
    if (!confirm("Delete this filing document from MongoDB?")) return;
    const res = await fetch(`/api/filings/${accession}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Document deleted from MongoDB.");
      router.push("/filings");
    } else {
      alert("Failed to delete document.");
    }
  };

  if (loading) return <p>Loading filing inspection data...</p>;
  if (!data) return <p>Filing accession not found.</p>;

  const { mongo, mysql } = data;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1>SEC Filing Inspector</h1>
          <p className="subtitle">
            Relational (MySQL) and Document (MongoDB) Cross-Database Inspector (Key: <code>{accession}</code>)
          </p>
        </div>

        {/* Role-based Admin Controls */}
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            {mongo?.parsed_status !== "PARSED" && (
              <button onClick={handleMarkParsed} className="btn btn-success">
                Mark as PARSED (PATCH)
              </button>
            )}
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Document (DELETE)
            </button>
          </div>
        )}
      </div>

      {actionMsg && <div className="alert-success">{actionMsg}</div>}

      <div className="inspector-grid">
        {/* Left Column: MongoDB NoSQL Document */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3>MongoDB Document (raw_sec_filings)</h3>
            <span className={`badge ${mongo?.parsed_status === "PARSED" ? "badge-parsed" : "badge-pending"}`}>
              {mongo?.parsed_status}
            </span>
          </div>

          <p style={{ fontSize: "0.85rem", marginBottom: 8, color: "#64748b" }}>
            <strong>Issuer:</strong> {mongo?.issuer_name} ({mongo?.issuer_ticker}) | <strong>Date:</strong> {mongo?.filing_date}
          </p>

          <h4 style={{ fontSize: "0.9rem", marginTop: 12, marginBottom: 4 }}>Raw SEC XML Payload:</h4>
          <pre className="code-box">{mongo?.raw_xml || "No raw XML available"}</pre>

          <h4 style={{ fontSize: "0.9rem", marginTop: 16, marginBottom: 4 }}>Parsed JSON Structure:</h4>
          <pre className="code-box" style={{ maxHeight: 200 }}>
            {JSON.stringify(mongo?.parsed, null, 2)}
          </pre>

          {mongo?.footnotes?.length > 0 && (
            <div style={{ marginTop: 12, fontSize: "0.85rem", color: "#475569" }}>
              <strong>Footnotes:</strong>
              <ul>
                {mongo.footnotes.map((fn, idx) => (
                  <li key={idx} style={{ marginLeft: 16 }}>{fn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: MySQL Relational Row */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3>MySQL Row (sec_filings table)</h3>
            <span className="badge" style={{ background: "#e2e8f0", color: "#334155" }}>
              Filing ID #{mysql?.filing_id}
            </span>
          </div>

          {mysql ? (
            <div>
              <table style={{ marginTop: 12 }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Accession Number</td>
                    <td><code>{mysql.accession_number}</code></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Company</td>
                    <td>
                      <Link href={`/companies/${mysql.company_id}`}>
                        {mysql.company_name} ({mysql.ticker})
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>CIK</td>
                    <td>{mysql.cik}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Filing Date</td>
                    <td>{mysql.filing_date?.slice(0, 10)}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Report Period</td>
                    <td>{mysql.report_period?.slice(0, 10) || "N/A"}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: 24, padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: "0.85rem", marginBottom: 4, color: "#1e293b" }}>Cross-Database Architecture Note:</h4>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  MySQL maintains normalized entity relationships and ACID transaction constraints. MongoDB stores high-volume, variable-schema SEC XML and JSON payloads. Both collections are unified by <code>accession_number</code>.
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: "#ef4444" }}>No matching row in MySQL sec_filings table.</p>
          )}
        </div>
      </div>
    </div>
  );
}
