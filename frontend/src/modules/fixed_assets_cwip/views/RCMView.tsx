import { useState } from "react";

export default function RCMView() {
  const [controls] = useState([
    { id: "CTRL-FA-01", process: "Physical Verification", risk: "Ghost assets in register", control: "Annual tag-to-register reconciliation", frequency: "Annual", owner: "A. Mehta", rating: "Effective" },
    { id: "CTRL-FA-02", process: "Depreciation", risk: "Incorrect useful life / method", control: "System-locked depreciation rates per class", frequency: "Quarterly", owner: "R. Sharma", rating: "Effective" },
    { id: "CTRL-FA-03", process: "CWIP Capitalisation", risk: "Delayed capitalisation", control: "365-day CWIP ageing review trigger", frequency: "Monthly", owner: "S. Kumar", rating: "Needs Improvement" },
    { id: "CTRL-FA-04", process: "Disposal", risk: "Unauthorised asset write-off", control: "Dual approval for disposal > ₹5L", frequency: "Per Event", owner: "N. Gupta", rating: "Effective" },
    { id: "CTRL-FA-05", process: "Capex Classification", risk: "Opex capitalised as capex", control: "Threshold-based classification checklist", frequency: "Per Transaction", owner: "V. Patel", rating: "Effective" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Risk & Control Matrix (RCM)</h3>
        <p style={{ color: "var(--slate)" }}>
          Maps key asset lifecycle risks to mitigating controls, their operating frequency, and effectiveness ratings.
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
              <tr key={c.id}>
                <td><strong>{c.id}</strong></td>
                <td>{c.process}</td>
                <td>{c.risk}</td>
                <td style={{ fontSize: 12 }}>{c.control}</td>
                <td>{c.frequency}</td>
                <td>{c.owner}</td>
                <td>
                  <span className={`badge ${c.rating === "Effective" ? "badge-success" : "badge-gold"}`}>
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
