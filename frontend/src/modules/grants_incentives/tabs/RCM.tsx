import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface RCM { risks: { id: string; risk: string; assertion: string; control: string }[]; controls: number; }

export default function RCM() {
  const [data, setData] = useState<RCM | null>(null);
  useEffect(() => { get<RCM>(`/api/modules/${SLUG}/rcm`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>ID</th><th>Risk</th><th>Assertion</th><th>Control</th></tr></thead>
          <tbody>
            {data.risks.map((r) => (
              <tr key={r.id}><td>{r.id}</td><td>{r.risk}</td><td>{r.assertion}</td><td>{r.control}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12, color: "var(--slate)", fontSize: 13 }}>Total controls: {data.controls}</p>
    </div>
  );
}
