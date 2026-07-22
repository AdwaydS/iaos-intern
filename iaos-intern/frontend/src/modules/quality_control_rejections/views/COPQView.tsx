import { useState } from "react";

export default function COPQView() {
  const [copqData] = useState({
    scrap: 45000,
    rework: 12500,
    recalls: 150000,
    inspection: 25000,
  });

  const total = copqData.scrap + copqData.rework + copqData.recalls + copqData.inspection;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Cost of Poor Quality (COPQ) Valuation</h3>
        <p style={{ color: "var(--slate)" }}>
          Financial valuation of waste (scrap, rework, recalls, external warranty failures) vs prevention inspection audits.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr 1fr" }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ color: "var(--navy)", marginBottom: 16 }}>COPQ Cost Center Breakdown</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Internal Scrap Losses</span>
              <strong>${copqData.scrap.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Rework Labor & Material</span>
              <strong>${copqData.rework.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Customer Returns & Recalls</span>
              <strong>${copqData.recalls.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--line-soft)", paddingBottom: 8 }}>
              <span>Inspection & Lab Verification Cost</span>
              <strong>${copqData.inspection.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, paddingTop: 8 }}>
              <span>Total Financial Impact</span>
              <span style={{ color: "var(--danger)" }}>${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <h4 style={{ color: "var(--navy)", marginBottom: 12 }}>Assurance Cost vs Failure Cost</h4>
          <div style={{ width: "100%", background: "var(--line-soft)", borderRadius: 10, height: 24, overflow: "hidden", display: "flex" }}>
            <div style={{ background: "var(--navy)", width: "11%", height: "100%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }} title="Assurance (Prevention)">11%</div>
            <div style={{ background: "var(--danger)", width: "89%", height: "100%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }} title="Failure (Scrap, Recalls)">89%</div>
          </div>
          <p style={{ fontSize: 13, color: "var(--slate)", marginTop: 16, textAlign: "center" }}>
            Current balance shows a heavy skew towards Failure Costs (89%). 
            Target is to increase prevention assurance spending to reduce total failure loss.
          </p>
        </div>
      </div>
    </div>
  );
}
