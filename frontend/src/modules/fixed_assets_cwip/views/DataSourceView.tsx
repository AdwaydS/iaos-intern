import { useState } from "react";

export default function DataSourceView() {
  const [sources] = useState([
    { id: "DS-FA-01", name: "SAP Asset Accounting (FI-AA)", type: "ERP Module", endpoint: "RFC: sap-asset-ledger", status: "Connected", lastSync: "2026-07-28 09:00" },
    { id: "DS-FA-02", name: "Oracle Fixed Assets Cloud", type: "ERP Module", endpoint: "REST: fa-cloud-api", status: "Connected", lastSync: "2026-07-28 08:30" },
    { id: "DS-FA-03", name: "Asset Physical Verification Mobile App", type: "IoT / Mobile", endpoint: "MQTT: asset-tags", status: "Connected", lastSync: "2026-07-27 18:00" },
    { id: "DS-FA-04", name: "Insurance Policy Register (Excel)", type: "Manual Upload", endpoint: "File: /uploads/insurance/", status: "Pending Sync", lastSync: "2026-07-15" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Data Source & Connector Setup</h3>
        <p style={{ color: "var(--slate)" }}>
          Manages connections to ERP asset registers, valuation systems, and physical verification data feeds for audit analysis.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Source ID</th>
              <th>Data Source</th>
              <th>Type</th>
              <th>Endpoint / Path</th>
              <th>Status</th>
              <th>Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.id}</strong></td>
                <td>{s.name}</td>
                <td>{s.type}</td>
                <td style={{ fontSize: 12, fontFamily: "monospace" }}>{s.endpoint}</td>
                <td>
                  <span className={`badge ${s.status === "Connected" ? "badge-success" : "badge-gold"}`}>
                    {s.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: "var(--slate)" }}>{s.lastSync}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
