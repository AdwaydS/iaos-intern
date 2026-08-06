import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const BASE = "/api/modules/software_license";

interface DashboardData {
  total_procedures: number;
  completed_procedures: number;
  coverage_pct: number;
  open_exceptions: number;
  open_findings: number;
  open_actions: number;
  risk_score: string;
}

export default function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    get<DashboardData>(`${BASE}/dashboard`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const cards = [
    { label: "Procedures Complete", value: `${data.completed_procedures}/${data.total_procedures}` },
    { label: "Coverage", value: `${data.coverage_pct}%` },
    { label: "Open Exceptions", value: data.open_exceptions },
    { label: "Open Findings", value: data.open_findings },
    { label: "Open Actions", value: data.open_actions },
    { label: "Risk Score", value: data.risk_score.toUpperCase() },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
      {cards.map((c) => (
        <div className="card" key={c.label} style={{ padding: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.6 }}>{c.label}</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
