import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface RemItem { ref: string; action: string; status: string; owner: string; }
interface Remediation { items: RemItem[]; total: number; }

export default function Remediation() {
  const [data, setData] = useState<Remediation | null>(null);
  useEffect(() => { get<Remediation>(`/api/modules/${SLUG}/remediation`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ padding: 18, marginBottom: 24, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.total}</div>
        <div style={{ color: "var(--slate)", fontSize: 13 }}>Open CAPA Items</div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Reference</th><th>Action</th><th>Owner</th><th>Status</th></tr></thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td>{item.ref}</td>
                <td>{item.action}</td>
                <td>{item.owner}</td>
                <td><span className={`badge ${item.status === "closed" ? "badge-success" : "badge-danger"}`}>{item.status}</span></td>
              </tr>
            ))}
            {data.items.length === 0 && <tr><td colSpan={4} style={{ color: "var(--slate)", textAlign: "center" }}>No remediation items.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
