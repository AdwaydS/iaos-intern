import { useState } from "react";

export default function WorkingPapersView() {
  const [papers] = useState([
    { ref: "WP-47-01", name: "Inward receiving bay process walkthrough", author: "Internal Audit Team", signedOff: true, reviewer: "L. Vance" },
    { ref: "WP-47-02", name: "Vendor defect cost calculation analysis", author: "QA Lead", signedOff: false, reviewer: "Pending" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Working Papers & Evidence Registry</h3>
        <p style={{ color: "var(--slate)" }}>
          Attach process walkthroughs, inspection sheets, CoA PDFs, and signoff reviews to document audit execution.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Paper Ref</th>
              <th>Document Name</th>
              <th>Prepared By</th>
              <th>Review Sign-off</th>
              <th>Signed By</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr key={p.ref}>
                <td><strong>{p.ref}</strong></td>
                <td>{p.name}</td>
                <td>{p.author}</td>
                <td>
                  <span className={`badge ${p.signedOff ? "badge-success" : "badge-gold"}`}>
                    {p.signedOff ? "Completed" : "Draft"}
                  </span>
                </td>
                <td>{p.reviewer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
