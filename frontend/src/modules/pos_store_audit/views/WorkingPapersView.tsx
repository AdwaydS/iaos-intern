import { useState } from "react";

export default function WorkingPapersView() {
  const [papers] = useState([
    { code: "WP-POS-01", title: "POS-to-Bank Reconciliation — March 2026", type: "Spreadsheet", uploadedBy: "A. Mehta", date: "20-Mar-2026", status: "Reviewed" },
    { code: "WP-POS-02", title: "Discount Override Analysis — Q1 2026", type: "Report", uploadedBy: "V. Patel", date: "18-Mar-2026", status: "Pending Review" },
    { code: "WP-POS-03", title: "Store Shrinkage Summary — Downtown", type: "Screenshot", uploadedBy: "S. Kumar", date: "15-Mar-2026", status: "Pending Review" },
    { code: "WP-POS-04", title: "Cash Variance Exception Evidence Package", type: "PDF", uploadedBy: "R. Sharma", date: "12-Mar-2026", status: "Approved" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Working Papers</h3>
        <p style={{ color: "var(--slate)" }}>
          Audit documentation, evidence files, and workpaper references for POS & Store Audit.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>WP Code</th>
              <th>Title</th>
              <th>Type</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.code}>
                <td><strong>{p.code}</strong></td>
                <td>{p.title}</td>
                <td><span className="badge badge-slate">{p.type}</span></td>
                <td>{p.uploadedBy}</td>
                <td>{p.date}</td>
                <td>
                  <span className={`badge ${p.status === "Approved" ? "badge-success" : p.status === "Reviewed" ? "badge-gold" : "badge-slate"}`}>
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
