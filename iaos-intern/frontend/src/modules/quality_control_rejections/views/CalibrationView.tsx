import { useState } from "react";

export default function CalibrationView() {
  const [instruments] = useState([
    { id: 1, name: "Vernier Caliper #12", type: "Dimensional", lastCal: "2026-01-10", nextCal: "2026-07-10", status: "Overdue" },
    { id: 2, name: "Mass Balance Scale A", type: "Gravimetric", lastCal: "2026-06-05", nextCal: "2026-12-05", status: "Calibrated" },
    { id: 3, name: "Spectrophotometer SP-2", type: "Chemical", lastCal: "2026-03-20", nextCal: "2026-09-20", status: "Calibrated" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Test Instrument & Gauge Calibration Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Calibration cycles are audited to prevent measurement error. 
          Non-calibrated gauges invalidates any inspection results captured with them.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Instrument / ID</th>
              <th>Measurement Type</th>
              <th>Last Cal Date</th>
              <th>Next Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((ins) => (
              <tr key={ins.id}>
                <td><strong>{ins.name}</strong></td>
                <td>{ins.type}</td>
                <td>{ins.lastCal}</td>
                <td>{ins.nextCal}</td>
                <td>
                  <span className={`badge ${ins.status === "Calibrated" ? "badge-success" : "badge-danger"}`}>
                    {ins.status}
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
