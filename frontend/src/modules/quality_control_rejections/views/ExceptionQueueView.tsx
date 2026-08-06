import { useState } from "react";

export default function ExceptionQueueView() {
  const [exceptions] = useState([
    { id: "EX-47-01", description: "CoA missing for Raw Lot LOT-2026-A109", item: "Lactose Base", date: "2026-07-12", severity: "Major", status: "New" },
    { id: "EX-47-02", description: "Instrument balance scale A used while overdue calibration", item: "Mass Scale #1", date: "2026-07-13", severity: "Critical", status: "Under Review" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Exception & Red-Flag Queue</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists anomalies detected by automated checks. Exceptions require documented justification or closure to restore status.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Exception ID</th>
              <th>Flagged Anomaly / Violation</th>
              <th>Relevant Asset</th>
              <th>Detected Date</th>
              <th>Severity</th>
              <th>Triage Status</th>
            </tr>
          </thead>
          <tbody>
            {exceptions.map((ex) => (
              <tr key={ex.id}>
                <td><strong>{ex.id}</strong></td>
                <td>{ex.description}</td>
                <td>{ex.item}</td>
                <td>{ex.date}</td>
                <td>
                  <span className={`badge ${ex.severity === "Critical" ? "badge-danger" : "badge-gold"}`}>
                    {ex.severity}
                  </span>
                </td>
                <td>
                  <span className="badge badge-slate">{ex.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
