import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface ExcItem {
  type: string;
  ref: string;
  detail: string;
}
interface Exc {
  exceptions: ExcItem[];
  total: number;
}

const TYPE_BADGE: Record<string, string> = {
  budget_breach: "badge-danger",
  cost_overrun: "badge-danger",
  schedule_delay: "badge-gold",
  cap_timing: "badge-gold",
  idle_capex: "badge-danger",
  po_splitting: "badge-danger",
};

export default function Exceptions() {
  const [data, setData] = useState<Exc | null>(null);
  useEffect(() => {
    get<Exc>(`/api/modules/${SLUG}/exceptions`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: data.total > 0 ? "var(--red)" : "var(--green)" }}>
          {data.total}
        </div>
        <div style={{ color: "var(--slate)", fontSize: 13 }}>Open Exceptions</div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Reference</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {data.exceptions.map((ex, i) => (
              <tr key={i}>
                <td>
                  <span className={`badge ${TYPE_BADGE[ex.type] ?? "badge-slate"}`}>{ex.type}</span>
                </td>
                <td>{ex.ref}</td>
                <td>{ex.detail}</td>
              </tr>
            ))}
            {data.exceptions.length === 0 && (
              <tr>
                <td colSpan={3} style={{ color: "var(--slate)", textAlign: "center" }}>
                  No exceptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
