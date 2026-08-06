import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface DS { sources: { name: string; type: string; entity: string }[]; total_sources: number; }

export default function DataSources() {
  const [data, setData] = useState<DS | null>(null);
  useEffect(() => { get<DS>(`/api/modules/${SLUG}/data-sources`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Source</th><th>Type</th><th>Entity</th></tr></thead>
          <tbody>
            {data.sources.map((s) => (
              <tr key={s.name}><td>{s.name}</td><td><span className="badge badge-slate">{s.type}</span></td><td>{s.entity}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12, color: "var(--slate)", fontSize: 13 }}>Total sources: {data.total_sources}</p>
    </div>
  );
}
