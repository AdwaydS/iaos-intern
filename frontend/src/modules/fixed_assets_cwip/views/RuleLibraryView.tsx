import { useState } from "react";

export default function RuleLibraryView() {
  const [rules] = useState([
    { id: "RULE-FA-01", name: "Ghost Asset Detection", type: "CAAT Script", target: "Asset Register", frequency: "Monthly", status: "Active" },
    { id: "RULE-FA-02", name: "CWIP > 365 Days Alert", type: "Analytics Rule", target: "CWIP Register", frequency: "Monthly", status: "Active" },
    { id: "RULE-FA-03", name: "Depreciation Rate Anomaly", type: "CAAT Script", target: "Depreciation Schedule", frequency: "Quarterly", status: "Active" },
    { id: "RULE-FA-04", name: "Duplicate Asset Tag Check", type: "Data Quality", target: "Asset Master", frequency: "Weekly", status: "Active" },
    { id: "RULE-FA-05", name: "Disposal Without Approval", type: "Compliance Rule", target: "Disposal Log", frequency: "Per Event", status: "Draft" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Test & Analytics Rule Library</h3>
        <p style={{ color: "var(--slate)" }}>
          Catalogue of automated CAAT rules, analytics scripts, and compliance tests applied to the fixed asset data domain.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Rule Name</th>
              <th>Type</th>
              <th>Target Data</th>
              <th>Frequency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.target}</td>
                <td>{r.frequency}</td>
                <td>
                  <span className={`badge ${r.status === "Active" ? "badge-success" : "badge-slate"}`}>
                    {r.status}
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
