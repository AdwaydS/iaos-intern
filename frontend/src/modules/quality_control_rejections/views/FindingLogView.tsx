import { useState } from "react";

export default function FindingLogView() {
  const [findings] = useState([
    { id: "OBS-47-1", name: "Incomplete CoA checklists at raw materials gate", grade: "Major Improvement Opportunity", owner: "Raw Materials Team", date: "2026-07-01", status: "Open" },
    { id: "OBS-47-2", name: "Calibration log backlog for critical lab gauges", grade: "Significant Control Deficiency", owner: "Maintenance Operations", date: "2026-07-10", status: "Under CAPA" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Observation & Finding Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines quality control gaps identified during audits, complete with risk grades and action plans.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Audit Observation</th>
              <th>Severity Grade</th>
              <th>Assigned Unit</th>
              <th>Logged Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {findings.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.id}</strong></td>
                <td>{f.name}</td>
                <td>
                  <span className={`badge ${f.grade.includes("Deficiency") ? "badge-danger" : "badge-gold"}`}>
                    {f.grade}
                  </span>
                </td>
                <td>{f.owner}</td>
                <td>{f.date}</td>
                <td>
                  <span className="badge badge-slate">{f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
