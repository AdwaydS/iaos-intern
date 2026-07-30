import { useState } from "react";

export default function ScopeUniverseView() {
  const [entities] = useState([
    { code: "ENT-POS-01", name: "Main Store — POS Terminal Network", type: "POS Terminal", riskRating: "High", controlOwner: "A. Mehta" },
    { code: "ENT-POS-02", name: "Main Store — Cash Till Operations", type: "Cash Process", riskRating: "High", controlOwner: "R. Sharma" },
    { code: "ENT-POS-03", name: "Settlement & Reconciliation Hub", type: "Settlement", riskRating: "Medium", controlOwner: "V. Patel" },
    { code: "ENT-POS-04", name: "Warehouse Inventory Pool", type: "Inventory", riskRating: "High", controlOwner: "S. Kumar" },
    { code: "ENT-POS-05", name: "Corporate Loyalty Points Ledger", type: "Loyalty", riskRating: "Medium", controlOwner: "N. Gupta" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scope & Audit Universe</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the auditable POS terminal networks, cash processes, settlement hubs, inventory pools, and loyalty systems in scope for POS & Store Audit.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Entity Code</th>
              <th>Auditable Unit / Asset Pool</th>
              <th>Type</th>
              <th>Risk Profile</th>
              <th>Control Owner</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr key={e.code}>
                <td><strong>{e.code}</strong></td>
                <td>{e.name}</td>
                <td>{e.type}</td>
                <td>
                  <span className={`badge ${e.riskRating === "High" ? "badge-danger" : "badge-gold"}`}>
                    {e.riskRating}
                  </span>
                </td>
                <td>{e.controlOwner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
