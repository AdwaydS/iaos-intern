import { useState } from "react";

export default function ActionTrackerView() {
  const [actions] = useState([
    { id: "ACT-FA-01", task: "Perform full physical re-verification of Factory Block A assets", owner: "R. Sharma", due: "2026-08-15", status: "In progress" },
    { id: "ACT-FA-02", task: "Capitalise or justify CWIP project CWIP-2025-009", owner: "S. Kumar", due: "2026-08-30", status: "In progress" },
    { id: "ACT-FA-03", task: "Update insurance policy mapping for high-value machinery", owner: "N. Gupta", due: "2026-07-20", status: "Completed" },
    { id: "ACT-FA-04", task: "Review depreciation rates for all asset classes per Ind AS 16", owner: "A. Mehta", due: "2026-09-01", status: "Not Started" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Remediation / Action Tracker</h3>
        <p style={{ color: "var(--slate)" }}>
          Tracks the closure of remediation items linked to fixed asset audit findings and management action plans.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Action ID</th>
              <th>Task Action Plan</th>
              <th>Action Owner</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id}>
                <td><strong>{a.id}</strong></td>
                <td>{a.task}</td>
                <td>{a.owner}</td>
                <td>{a.due}</td>
                <td>
                  <span className={`badge ${a.status === "Completed" ? "badge-success" : a.status === "In progress" ? "badge-gold" : "badge-slate"}`}>
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
