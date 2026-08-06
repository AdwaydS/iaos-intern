import { useState } from "react";

export default function AuditTrailView() {
  const [logs] = useState([
    { id: 1, timestamp: "2026-07-13 10:15:30", user: "system_caat", description: "Inspection Lot LOT-2026-A99 marked Passed", source: "MES DB Sync" },
    { id: 2, timestamp: "2026-07-13 09:22:11", user: "k.vance", description: "COA spec check override on Material API-Base-3", source: "User override" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Tamper-Proof Quality Audit Trail</h3>
        <p style={{ color: "var(--slate)" }}>
          Lists automated system checks and manual overrides. 
          Audits the security integrity of quality system parameters.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Trigger Entity / User</th>
              <th>Audit Log Description</th>
              <th>Action Origin</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td><strong>{l.timestamp}</strong></td>
                <td>{l.user}</td>
                <td>{l.description}</td>
                <td>
                  <span className="badge badge-slate">{l.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
