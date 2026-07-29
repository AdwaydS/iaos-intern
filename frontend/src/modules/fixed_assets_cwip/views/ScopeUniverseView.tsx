import { useState } from "react";

export default function ScopeUniverseView() {
  const [entities] = useState([
    { code: "ENT-FA-01", name: "Head Office Fixed Asset Register", type: "Register", riskRating: "High", controlOwner: "A. Mehta" },
    { code: "ENT-FA-02", name: "Factory Block A — Plant & Machinery", type: "Location", riskRating: "High", controlOwner: "R. Sharma" },
    { code: "ENT-FA-03", name: "Factory Block B — IT Equipment Pool", type: "Location", riskRating: "Medium", controlOwner: "V. Patel" },
    { code: "ENT-FA-04", name: "Warehouse — Civil Works & CWIP", type: "Project", riskRating: "High", controlOwner: "S. Kumar" },
    { code: "ENT-FA-05", name: "Corporate Office — Leased Premises", type: "Lease", riskRating: "Medium", controlOwner: "N. Gupta" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scope & Audit Universe</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the auditable asset pools, locations, CWIP projects, and lease portfolios in scope for Fixed Assets & CWIP audit.
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
