import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface Source {
  name: string;
  type: string;
  entity: string;
  purpose: string;
}
interface Sources {
  sources: Source[];
  total_sources: number;
}

export default function DataSources() {
  const [data, setData] = useState<Sources | null>(null);
  useEffect(() => {
    get<Sources>(`/api/modules/${SLUG}/data-sources`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Entity</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {data.sources.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>
                  <span className={`badge ${s.type === "table" ? "badge-slate" : "badge-gold"}`}>{s.type}</span>
                </td>
                <td>{s.entity}</td>
                <td>{s.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12, color: "var(--slate)", fontSize: 13 }}>
        Mapped connectors: {data.total_sources}
      </p>
    </div>
  );
}
