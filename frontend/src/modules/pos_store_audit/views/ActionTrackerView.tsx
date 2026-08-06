import { useState } from "react";

export default function ActionTrackerView() {
  const [actions] = useState([
    { code: "ACT-POS-01", task: "Complete POS-to-Bank reconciliation for all stores for March 2026", owner: "A. Mehta", due: "31-Mar-2026", status: "In Progress" },
    { code: "ACT-POS-02", task: "Investigate flagged discount overrides exceeding threshold at Mall Store", owner: "V. Patel", due: "05-Apr-2026", status: "Not Started" },
    { code: "ACT-POS-03", task: "Conduct surprise cash count at Uptown Store within this week", owner: "R. Sharma", due: "28-Mar-2026", status: "Completed" },
    { code: "ACT-POS-04", task: "Review and update CAAT rule thresholds for shrinkage detection", owner: "S. Kumar", due: "15-Apr-2026", status: "Not Started" },
    { code: "ACT-POS-05", task: "Prepare quarterly POS audit summary report for audit committee", owner: "N. Gupta", due: "10-Apr-2026", status: "In Progress" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Action Tracker</h3>
        <p style={{ color: "var(--slate)" }}>
          Remediation actions, tasks, and follow-ups arising from POS & Store Audit procedures.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Action ID</th>
              <th>Task Description</th>
              <th>Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.code}>
                <td><strong>{a.code}</strong></td>
                <td>{a.task}</td>
                <td>{a.owner}</td>
                <td>{a.due}</td>
                <td>
                  <span className={`badge ${a.status === "Completed" ? "badge-success" : a.status === "In Progress" ? "badge-gold" : "badge-slate"}`}>
                    {a.status}
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
