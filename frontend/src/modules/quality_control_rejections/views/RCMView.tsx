import { useState } from "react";

export default function RCMView() {
  const [rcm] = useState([
    { id: "R-47-1", risk: "Raw materials consumed in production without CoA clearance", control: "Automated block on raw materials release unless validated CoA checkbox is checked", type: "Preventive", owner: "QA Director" },
    { id: "R-47-2", risk: "Faulty measuring gauges yield false-positive inspections", control: "Mandatory system lockout for instruments whose calibration date is overdue", type: "Preventive", owner: "Maintenance Lead" },
    { id: "R-47-3", risk: "Defective batches bypassed and released to customers", control: "Pre-dispatch signature checks and release checks forced in shipping app", type: "Preventive", owner: "QP Releasing Officer" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Risk & Control Matrix (RCM)</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists the critical control matrix scoped to Quality Operations, linking risks to active mitigations and owners.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Risk ID</th>
              <th>Risk Description</th>
              <th>Mitigating Control Activity</th>
              <th>Control Type</th>
              <th>Control Owner</th>
            </tr>
          </thead>
          <tbody>
            {rcm.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.id}</strong></td>
                <td>{r.risk}</td>
                <td>{r.control}</td>
                <td>
                  <span className="badge badge-slate">{r.type}</span>
                </td>
                <td>{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
