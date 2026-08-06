import { useState } from "react";

export default function FindingLogView() {
  const [findings] = useState([
    { id: "FIND-FA-01", title: "Unreconciled ghost assets identified during floor walkthrough", category: "Existence", severity: "High", owner: "A. Mehta", status: "Open" },
    { id: "FIND-FA-02", title: "Three CWIP projects older than 24 months without capitalisation", category: "Classification", severity: "High", owner: "S. Kumar", status: "In Progress" },
    { id: "FIND-FA-03", title: "Insurance coverage gaps on high-value machinery", category: "Completeness", severity: "Medium", owner: "N. Gupta", status: "Open" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Observation & Finding Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Records audit observations and findings arising from fixed asset procedures, linked to root causes and recommended actions.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Observation</th>
              <th>Assertion</th>
              <th>Severity</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.id}</strong></td>
                <td>{f.title}</td>
                <td>{f.category}</td>
                <td>
                  <span className={`badge ${f.severity === "High" ? "badge-danger" : "badge-gold"}`}>
                    {f.severity}
                  </span>
                </td>
                <td>{f.owner}</td>
                <td>
                  <span className={`badge ${f.status === "Closed" ? "badge-success" : f.status === "In Progress" ? "badge-gold" : "badge-danger"}`}>
                    {f.status}
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
