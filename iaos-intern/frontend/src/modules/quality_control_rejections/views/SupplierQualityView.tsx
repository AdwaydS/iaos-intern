import { useState } from "react";

export default function SupplierQualityView() {
  const [suppliers] = useState([
    { id: 1, name: "Global Chemical Corp", lotsReceived: 45, defectsFound: 1, coaCompliance: 100, score: 98, grade: "A" },
    { id: 2, name: "Apex Industrial Solutions", lotsReceived: 32, defectsFound: 3, coaCompliance: 94, score: 85, grade: "B" },
    { id: 3, name: "Delta Pack Inc", lotsReceived: 14, defectsFound: 2, coaCompliance: 71, score: 68, grade: "D" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Supplier Quality Rating</h3>
        <p style={{ color: "var(--slate)" }}>
          Defect scoring tracks incoming vendor compliance rates. 
          Persistent quality deviations trigger supplier audit flags or procurement restrictions.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Lots Received</th>
              <th>Defect Logs</th>
              <th>CoA Compliance</th>
              <th>Weighted Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.lotsReceived}</td>
                <td style={{ color: s.defectsFound > 0 ? "var(--danger)" : "var(--success)" }}>{s.defectsFound}</td>
                <td>{s.coaCompliance}%</td>
                <td>
                  <strong>{s.score} / 100</strong>
                </td>
                <td>
                  <span className={`badge ${s.grade === "A" ? "badge-success" : s.grade === "B" ? "badge-gold" : "badge-danger"}`}>
                    Grade {s.grade}
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
