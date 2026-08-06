import { useState } from "react";

export default function BatchReleaseView() {
  const [batches] = useState([
    { id: 1, batchNo: "B-PHARMA-7731", checksPassed: 5, totalChecks: 5, releaseBy: "Dr. Karen Vance", status: "Released" },
    { id: 2, batchNo: "B-PHARMA-7732", checksPassed: 3, totalChecks: 5, releaseBy: "Pending QC Signoff", status: "Quarantined" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Batch Release Governance</h3>
        <p style={{ color: "var(--slate)" }}>
          Every batch requires all safety, packaging, and spec checks completed before a qualified QP/release officer signs off.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Gate Verification</th>
              <th>Release Officer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.batchNo}</strong></td>
                <td>
                  {b.checksPassed} of {b.totalChecks} checks verified
                  <div style={{ background: "var(--line-soft)", borderRadius: 4, height: 6, width: "100%", marginTop: 4, overflow: "hidden" }}>
                    <div style={{ background: b.checksPassed === b.totalChecks ? "var(--success)" : "var(--gold)", height: "100%", width: `${(b.checksPassed/b.totalChecks)*100}%` }}></div>
                  </div>
                </td>
                <td>{b.releaseBy}</td>
                <td>
                  <span className={`badge ${b.status === "Released" ? "badge-success" : "badge-danger"}`}>
                    {b.status}
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
