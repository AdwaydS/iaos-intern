import { useState } from "react";

export default function DeviationCAPAView() {
  const [deviations] = useState([
    { id: 1, ref: "DEV-2026-08", description: "Cleanroom humidity spiked to 64%", date: "2026-06-12", capaLink: "CAPA-991", status: "Closed" },
    { id: 2, ref: "DEV-2026-09", description: "Wrong label batch fed to line 4", date: "2026-07-02", capaLink: "CAPA-994", status: "Open" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Quality Deviations & CAPA Log</h3>
        <p style={{ color: "var(--slate)" }}>
          Ensure all process deviations are linked to an active CAPA item, and closed timely to ensure compliance.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Deviation Ref</th>
              <th>Incident Details</th>
              <th>Log Date</th>
              <th>Linked CAPA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {deviations.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.ref}</strong></td>
                <td>{d.description}</td>
                <td>{d.date}</td>
                <td>
                  <span className="badge badge-slate">{d.capaLink}</span>
                </td>
                <td>
                  <span className={`badge ${d.status === "Closed" ? "badge-success" : "badge-danger"}`}>
                    {d.status}
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
