import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface KPI { total_schemes: number; total_claims: number; total_claimed: number; total_computed: number; variance: number; total_received: number; open_clawbacks: number; overdue_deadlines: number; realisation_pct: number; }

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  useEffect(() => { get<KPI>(`/api/modules/${SLUG}/dashboard`).then(setKpi); }, []);

  if (!kpi) return <p>Loading...</p>;

  const cards = [
    { label: "Total Schemes", value: kpi.total_schemes, color: "var(--navy)" },
    { label: "Total Claims", value: kpi.total_claims, color: "var(--navy)" },
    { label: "Total Claimed", value: `₹${kpi.total_claimed.toLocaleString()}`, color: "var(--navy)" },
    { label: "Total Received", value: `₹${kpi.total_received.toLocaleString()}`, color: "var(--green)" },
    { label: "Claim Variance", value: `₹${kpi.variance.toLocaleString()}`, color: kpi.variance > 0 ? "var(--red)" : "var(--green)" },
    { label: "Realisation %", value: `${kpi.realisation_pct}%`, color: kpi.realisation_pct >= 80 ? "var(--green)" : "var(--red)" },
    { label: "Open Clawbacks", value: kpi.open_clawbacks, color: kpi.open_clawbacks > 0 ? "var(--red)" : "var(--green)" },
    { label: "Overdue Deadlines", value: kpi.overdue_deadlines, color: kpi.overdue_deadlines > 0 ? "var(--red)" : "var(--green)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: c.color }}>{c.value}</div>
          <div style={{ color: "var(--slate)", fontSize: 13, marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
