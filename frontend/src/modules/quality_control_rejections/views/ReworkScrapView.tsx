import { useState } from "react";

export default function ReworkScrapView() {
  const [items] = useState([
    { id: 1, item: "PCB Assembly #990", defect: "Micro-soldering error", scrapCost: 450, reworkCost: 120, decision: "rework", status: "Approved" },
    { id: 2, item: "Glass Vial Batch H", defect: "Micro-crack detected", scrapCost: 1200, reworkCost: 9999, decision: "scrap", status: "Approved" },
    { id: 3, item: "Plastic Housing XL", defect: "Flash excess", scrapCost: 15, reworkCost: 3, decision: "rework", status: "Pending review" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Rework vs Scrap Decision Board</h3>
        <p style={{ color: "var(--slate)" }}>
          Defective materials must go through a formal cost disposition analysis. 
          Rework is favored when rework labor/material cost is lower than scrap replacement cost, subject to regulatory constraints.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Defective Item</th>
              <th>Defect Details</th>
              <th>Scrap Cost</th>
              <th>Rework Cost</th>
              <th>Optimal Decision</th>
              <th>Approval State</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td><strong>{it.item}</strong></td>
                <td>{it.defect}</td>
                <td style={{ color: "var(--danger)" }}>${it.scrapCost}</td>
                <td style={{ color: "var(--success)" }}>${it.reworkCost}</td>
                <td>
                  <span className={`badge ${it.decision === "rework" ? "badge-gold" : "badge-danger"}`}>
                    {it.decision.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${it.status === "Approved" ? "badge-success" : "badge-slate"}`}>
                    {it.status}
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
