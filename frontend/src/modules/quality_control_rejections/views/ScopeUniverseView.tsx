import { useState } from "react";

export default function ScopeUniverseView() {
  const [entities] = useState([
    { code: "ENT-QA-01", name: "Inward Raw Material Receiving Bay", type: "Process Gate", riskRating: "High", controlOwner: "J. Myers" },
    { code: "ENT-QA-02", name: "Cleanroom Assembly Line 2", type: "Stage Gate", riskRating: "Medium", controlOwner: "M. Jenkins" },
    { code: "ENT-QA-03", name: "Finished Goods Pack & Release Warehouse", type: "Dispatch Gate", riskRating: "High", controlOwner: "S. Roberts" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Scope & Audit Universe</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines the auditable processes, storage locations, and testing facilities in scope for Quality Control & Rejections.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Entity Code</th>
              <th>Auditable Unit / Process</th>
              <th>Gate Type</th>
              <th>Risk Profile</th>
              <th>Assigned Owner</th>
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
