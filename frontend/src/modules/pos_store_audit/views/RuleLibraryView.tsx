import { useState } from "react";

export default function RuleLibraryView() {
  const [rules] = useState([
    { code: "CAAT-POS-01", description: "Match POS daily sales total to bank credit entries; flag variances > 2%", threshold: "> 2% variance", frequency: "Daily", status: "Active" },
    { code: "CAAT-POS-02", description: "Detect cash till variances exceeding tolerance threshold per store", threshold: "> 500", frequency: "Daily", status: "Active" },
    { code: "CAAT-POS-03", description: "Flag discount overrides exceeding 20% without tier-2 approval", threshold: "> 20% discount", frequency: "Real-time", status: "Active" },
    { code: "CAAT-POS-04", description: "Identify duplicate or excessive void/refund patterns by cashier", threshold: "> 3 voids/shift", frequency: "Daily", status: "Active" },
    { code: "CAAT-POS-05", description: "Detect stock shrinkage events exceeding materiality threshold", threshold: "> 10,000 loss", frequency: "Monthly", status: "Active" },
    { code: "CAAT-POS-06", description: "Flag loyalty points accrual anomalies relative to transaction value", threshold: "> 15% accrual rate", frequency: "Daily", status: "Active" },
    { code: "CAAT-POS-07", description: "Identify settlement delays exceeding T+2 for card/wallet transactions", threshold: "> 2 days", frequency: "Daily", status: "Inactive" },
    { code: "CAAT-POS-08", description: "Flag employee purchase discounts exceeding policy limits", threshold: "> 10% discount", frequency: "Real-time", status: "Active" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>CAAT Rule Library</h3>
        <p style={{ color: "var(--slate)" }}>
          Continuous auditing rules configured for automated detection of anomalies in POS & Store operations.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Rule Code</th>
              <th>Rule Description</th>
              <th>Threshold</th>
              <th>Frequency</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.code}>
                <td><strong>{r.code}</strong></td>
                <td>{r.description}</td>
                <td><span className="badge badge-slate">{r.threshold}</span></td>
                <td>{r.frequency}</td>
                <td>
                  <span className={`badge ${r.status === "Active" ? "badge-success" : "badge-slate"}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
