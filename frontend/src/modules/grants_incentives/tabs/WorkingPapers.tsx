import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Paper { id: number; name: string; status: string; }
interface WP { papers: Paper[]; total: number; }

export default function WorkingPapers() {
  const [data, setData] = useState<WP | null>(null);
  useEffect(() => { get<WP>(`/api/modules/${SLUG}/working-papers`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.total}</div>
        <div style={{ color: "var(--slate)", fontSize: 13 }}>Working Papers</div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Status</th></tr></thead>
          <tbody>
            {data.papers.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td><span className={`badge ${p.status === "reviewed" ? "badge-success" : "badge-gold"}`}>{p.status}</span></td>
              </tr>
            ))}
            {data.papers.length === 0 && <tr><td colSpan={3} style={{ color: "var(--slate)", textAlign: "center" }}>No working papers attached.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
