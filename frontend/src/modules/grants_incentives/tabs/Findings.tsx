import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Find { type: string; ref: string; severity: string; detail: string; }
interface Findings { findings: Find[]; total: number; }

export default function Findings() {
  const [data, setData] = useState<Findings | null>(null);
  useEffect(() => { get<Findings>(`/api/modules/${SLUG}/findings`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  const sevBadge = (s: string) => s === "high" ? "badge-danger" : s === "medium" ? "badge-gold" : "badge-success";

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: data.total > 0 ? "var(--red)" : "var(--green)" }}>{data.total}</div>
        <div style={{ color: "var(--slate)", fontSize: 13 }}>Open Findings</div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Type</th><th>Reference</th><th>Severity</th><th>Detail</th></tr></thead>
          <tbody>
            {data.findings.map((f, i) => (
              <tr key={i}>
                <td><span className="badge badge-slate">{f.type}</span></td>
                <td>{f.ref}</td>
                <td><span className={`badge ${sevBadge(f.severity)}`}>{f.severity}</span></td>
                <td>{f.detail}</td>
              </tr>
            ))}
            {data.findings.length === 0 && <tr><td colSpan={4} style={{ color: "var(--slate)", textAlign: "center" }}>No findings logged.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
