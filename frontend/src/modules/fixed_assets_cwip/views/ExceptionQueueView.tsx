import { useState } from "react";

export default function ExceptionQueueView() {
  const [exceptions] = useState([
    { id: "EX-FA-01", description: "Asset FA-2026-01204 not physically located during verification round", asset: "CNC Milling Machine", date: "2026-07-20", severity: "Critical", status: "New" },
    { id: "EX-FA-02", description: "CWIP project CWIP-2025-009 exceeds 540 days without capitalisation", asset: "New Warehouse Phase II", date: "2026-07-22", severity: "Major", status: "Under Review" },
    { id: "EX-FA-03", description: "Depreciation rate for FA-2026-00877 deviates from asset class standard", asset: "Office Furniture Set", date: "2026-07-25", severity: "Minor", status: "Resolved" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Exception & Red-Flag Queue</h3>
        <p style={{ color: "var(--slate)" }}>
          Flags anomalies detected by automated CAAT rules against the asset register, CWIP tracker, and depreciation schedules.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Exception ID</th>
              <th>Flagged Anomaly</th>
              <th>Related Asset</th>
              <th>Detected</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((ex) => (
              <tr key={ex.id}>
                <td><strong>{ex.id}</strong></td>
                <td>{ex.description}</td>
                <td>{ex.asset}</td>
                <td>{ex.date}</td>
                <td>
                  <span className={`badge ${ex.severity === "Critical" ? "badge-danger" : ex.severity === "Major" ? "badge-gold" : "badge-slate"}`}>
                    {ex.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge ${ex.status === "Resolved" ? "badge-success" : ex.status === "New" ? "badge-danger" : "badge-gold"}`}>
                    {ex.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
