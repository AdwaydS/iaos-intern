import { useState } from "react";

export default function RCMView() {
  const [controls] = useState([
    { code: "CTRL-POS-01", process: "POS-to-Bank Reconciliation", risk: "Misstatement of daily sales due to unreconciled POS vs bank credits", activity: "Daily automated reconciliation with variance threshold monitoring", frequency: "Daily", owner: "A. Mehta", rating: "High" },
    { code: "CTRL-POS-02", process: "Cash Till Management", risk: "Cash theft or misappropriation at point of sale", activity: "Surprise cash counts and end-of-day till balancing", frequency: "Daily", owner: "R. Sharma", rating: "Critical" },
    { code: "CTRL-POS-03", process: "Discount Override", risk: "Unauthorised discounts resulting in revenue leakage", activity: "Manager approval required above threshold; periodic review of override log", frequency: "Real-time", owner: "V. Patel", rating: "High" },
    { code: "CTRL-POS-04", process: "Void/Refund Processing", risk: "Fictitious refunds and voided transactions for fraud", activity: "Supervisor PIN required; daily exception report review", frequency: "Daily", owner: "S. Kumar", rating: "High" },
    { code: "CTRL-POS-05", process: "Store Inventory Accuracy", risk: "Stock shrinkage due to theft, damage, or process errors", activity: "Cycle counts and variance investigation within 48 hours", frequency: "Weekly", owner: "N. Gupta", rating: "Medium" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Risk & Control Matrix (RCM)</h3>
        <p style={{ color: "var(--slate)" }}>
          Mapping of key risks and associated controls for POS & Store Audit domain.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Control ID</th>
              <th>Process Area</th>
              <th>Risk Description</th>
              <th>Control Activity</th>
              <th>Frequency</th>
              <th>Owner</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr key={c.code}>
                <td><strong>{c.code}</strong></td>
                <td>{c.process}</td>
                <td>{c.risk}</td>
                <td>{c.activity}</td>
                <td><span className="badge badge-slate">{c.frequency}</span></td>
                <td>{c.owner}</td>
                <td>
                  <span className={`badge ${c.rating === "Critical" ? "badge-danger" : c.rating === "High" ? "badge-gold" : "badge-success"}`}>
                    {c.rating}
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
