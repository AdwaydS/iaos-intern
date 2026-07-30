import { useState } from "react";

export default function FindingLogView() {
  const [findings] = useState([
    { code: "FIND-POS-01", finding: "POS-to-Bank reconciliation not performed for 3 consecutive days at Downtown Store", severity: "Critical", owner: "A. Mehta", status: "Open" },
    { code: "FIND-POS-02", finding: "Discount overrides exceeding 25% lack documented manager approval in 12 instances", severity: "High", owner: "V. Patel", status: "Under Investigation" },
    { code: "FIND-POS-03", finding: "Cash variance of 3,500 at Uptown Store not investigated within defined SLA", severity: "High", owner: "R. Sharma", status: "Open" },
    { code: "FIND-POS-04", finding: "Inventory shrinkage reported but root cause analysis pending for 45 days", severity: "Medium", owner: "S. Kumar", status: "Remediated" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Finding Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Audit findings, observations, and remediation tracking for POS & Store Audit.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Finding Description</th>
              <th>Severity</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.code}>
                <td><strong>{f.code}</strong></td>
                <td>{f.finding}</td>
                <td>
                  <span className={`badge ${f.severity === "Critical" ? "badge-danger" : f.severity === "High" ? "badge-gold" : "badge-success"}`}>
                    {f.severity}
                  </span>
                </td>
                <td>{f.owner}</td>
                <td>
                  <span className={`badge ${f.status === "Open" ? "badge-danger" : f.status === "Under Investigation" ? "badge-gold" : "badge-success"}`}>
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
