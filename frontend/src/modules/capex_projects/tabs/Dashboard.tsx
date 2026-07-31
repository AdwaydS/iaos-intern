import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface KPI {
  total_projects: number;
  open_afes: number;
  total_capex: number;
  actual_spend: number;
  budget_pct: number;
  cost_overruns: number;
  schedule_delays: number;
  capitalisation_delays: number;
  idle_abandoned: number;
  flagged_splits: number;
  open_advances: number;
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  useEffect(() => {
    get<KPI>(`/api/modules/${SLUG}/dashboard`).then(setKpi);
  }, []);

  if (!kpi) return <p>Loading...</p>;

  const cards = [
    { label: "Total Projects", value: kpi.total_projects, color: "var(--navy)" },
    { label: "Open AFEs", value: kpi.open_afes, color: "var(--navy)" },
    { label: "Total Capex (₹)", value: kpi.total_capex.toLocaleString(), color: "var(--navy)" },
    { label: "Actual Spend (₹)", value: kpi.actual_spend.toLocaleString(), color: "var(--navy)" },
    {
      label: "Budget Used",
      value: `${kpi.budget_pct}%`,
      color: kpi.budget_pct > 100 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Cost Overruns",
      value: kpi.cost_overruns,
      color: kpi.cost_overruns > 0 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Schedule Delays",
      value: kpi.schedule_delays,
      color: kpi.schedule_delays > 0 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Cap. Timing Delays",
      value: kpi.capitalisation_delays,
      color: kpi.capitalisation_delays > 0 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Idle / Abandoned",
      value: kpi.idle_abandoned,
      color: kpi.idle_abandoned > 0 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Flagged PO Splits",
      value: kpi.flagged_splits,
      color: kpi.flagged_splits > 0 ? "var(--red)" : "var(--green)",
    },
    {
      label: "Open Advances (₹)",
      value: kpi.open_advances.toLocaleString(),
      color: kpi.open_advances > 0 ? "var(--red)" : "var(--green)",
    },
  ];

  return (
    <div>
      <p style={{ color: "var(--slate)", marginBottom: 18, fontSize: 13 }}>
        Live risk score, open exceptions, coverage and trend for the Capex & Project Monitoring domain.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ color: "var(--slate)", fontSize: 13, marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
