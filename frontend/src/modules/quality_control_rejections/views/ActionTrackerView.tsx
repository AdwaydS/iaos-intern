import { useState } from "react";

export default function ActionTrackerView() {
  const [actions] = useState([
    { id: "ACT-47-1", task: "Formulate automated CoA check bypass rule in ERP", owner: "J. Myers", due: "2026-08-15", status: "In progress" },
    { id: "ACT-47-2", task: "Perform full audit of all calibration cert labels", owner: "M. Jenkins", due: "2026-07-30", status: "Completed" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Remediation / CAPA Action Tracker</h3>
        <p style={{ color: "var(--slate)" }}>
          Tracks the closure of remediation items linked to quality findings.
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
                  <span className={`badge ${a.status === "Completed" ? "badge-success" : "badge-gold"}`}>
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
