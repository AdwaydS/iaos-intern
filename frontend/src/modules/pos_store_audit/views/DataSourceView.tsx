import { useState } from "react";

export default function DataSourceView() {
  const [sources] = useState([
    { name: "POS Transaction Table", system: "POS System", type: "Transactional", refresh: "Real-time", status: "Connected" },
    { name: "Bank Settlement File", system: "Bank Portal", type: "File Import", refresh: "Daily", status: "Connected" },
    { name: "Cash Till Counts", system: "Store Operations", type: "Manual Entry", refresh: "Daily", status: "Connected" },
    { name: "Discount Override Log", system: "POS System", type: "Transactional", refresh: "Real-time", status: "Connected" },
    { name: "Inventory Movement Register", system: "WMS", type: "Transactional", refresh: "Real-time", status: "Connected" },
    { name: "Loyalty Points Ledger", system: "CRM", type: "Transactional", refresh: "Daily", status: "Connected" },
    { name: "Employee Purchase Register", system: "HRMS", type: "Transactional", refresh: "Daily", status: "Disconnected" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Data Sources</h3>
        <p style={{ color: "var(--slate)" }}>
          Data sources, systems, and integration points used for POS & Store Audit procedures.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Data Source</th>
              <th>System</th>
              <th>Type</th>
              <th>Refresh Interval</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s, i) => (
              <tr key={i}>
                <td><strong>{s.name}</strong></td>
                <td>{s.system}</td>
                <td>{s.type}</td>
                <td>{s.refresh}</td>
                <td>
                  <span className={`badge ${s.status === "Connected" ? "badge-success" : "badge-danger"}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
