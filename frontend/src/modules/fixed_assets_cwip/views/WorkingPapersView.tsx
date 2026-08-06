import { useState } from "react";

export default function WorkingPapersView() {
  const [papers] = useState([
    { id: "WP-FA-01", title: "Physical Verification — Factory Block A", preparedBy: "R. Sharma", date: "2026-07-15", status: "Reviewed", evidenceCount: 42 },
    { id: "WP-FA-02", title: "CWIP Ageing Analysis — FY 2025-26", preparedBy: "S. Kumar", date: "2026-07-18", status: "Draft", evidenceCount: 12 },
    { id: "WP-FA-03", title: "Depreciation Recomputation — P&M Class", preparedBy: "A. Mehta", date: "2026-07-20", status: "Reviewed", evidenceCount: 28 },
    { id: "WP-FA-04", title: "Disposal Governance — High Value Items", preparedBy: "N. Gupta", date: "2026-07-22", status: "Final", evidenceCount: 18 },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Working Papers & Evidence</h3>
        <p style={{ color: "var(--slate)" }}>
          Repository of audit working papers, supporting computations, and evidence documents for fixed asset audit procedures.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Paper ID</th>
              <th>Title</th>
              <th>Prepared By</th>
              <th>Date</th>
              <th>Evidence Items</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td>{p.title}</td>
                <td>{p.preparedBy}</td>
                <td>{p.date}</td>
                <td>{p.evidenceCount}</td>
                <td>
                  <span className={`badge ${p.status === "Final" ? "badge-success" : p.status === "Reviewed" ? "badge-gold" : "badge-slate"}`}>
                    {p.status}
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
