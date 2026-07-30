import { useState } from "react";

export default function RuleLibraryView() {
  const [rules] = useState([
    { id: "RULE-QC-01", name: "Expired CoA Inspection Bypass", query: "SELECT * FROM coa WHERE valid_until < NOW()", status: "Active" },
    { id: "RULE-QC-02", name: "High Scrap Rate Alert (>5%)", query: "SELECT * FROM rejections WHERE disposition='scrap' and quantity > 50", status: "Active" },
    { id: "RULE-QC-03", name: "Overdue Gauge Calibration Check", query: "SELECT * FROM calibration WHERE next_cal < NOW()", status: "Active" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Test & Analytics Rule Library</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the automated CAAT rules that monitor the production database to flag process deviations or controls bypass.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Rule Name</th>
              <th>Technical CAAT Query (SQL)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.name}</td>
                <td><code style={{ background: "var(--line-soft)", padding: "2px 6px", borderRadius: 4, fontSize: 13 }}>{r.query}</code></td>
                <td>
                  <span className="badge badge-success">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
