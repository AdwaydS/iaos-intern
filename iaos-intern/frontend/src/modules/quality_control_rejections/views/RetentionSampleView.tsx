import { useState } from "react";

export default function RetentionSampleView() {
  const [samples] = useState([
    { id: 1, sampleId: "SMP-7731-01", batchRef: "B-PHARMA-7731", roomLocation: "Vault B - Shelf 3", ageMonths: 5, status: "Active" },
    { id: 2, sampleId: "SMP-7612-04", batchRef: "B-PHARMA-7612", roomLocation: "Vault A - Shelf 1", ageMonths: 24, status: "Expired / Disposed" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Retention Sample Registry</h3>
        <p style={{ color: "var(--slate)" }}>
          Auditing of physically stored control samples to verify that regulatory shelf-life checks can be conducted on demand.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Batch Reference</th>
              <th>Storage Location</th>
              <th>Retention Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.sampleId}</strong></td>
                <td>{s.batchRef}</td>
                <td>{s.roomLocation}</td>
                <td>{s.ageMonths} Months</td>
                <td>
                  <span className={`badge ${s.status === "Active" ? "badge-success" : "badge-slate"}`}>
                    {s.status}
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
