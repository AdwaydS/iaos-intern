import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface Unit {
  name: string;
  records: number;
}
interface Scope {
  module_name: string;
  projects: string[];
  units: Unit[];
}

export default function Scope() {
  const [data, setData] = useState<Scope | null>(null);
  useEffect(() => {
    get<Scope>(`/api/modules/${SLUG}/scope`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Projects in Scope</h3>
        <p style={{ color: "var(--slate)", fontSize: 13, marginBottom: 12 }}>{data.module_name}</p>
        {data.projects.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No projects registered yet.</p>
        ) : (
          <ul>
            {data.projects.map((p) => (
              <li key={p} style={{ padding: "4px 0" }}>
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <h3 style={{ color: "var(--navy)", padding: "22px 22px 12px" }}>Auditable Units</h3>
        <table>
          <thead>
            <tr>
              <th>Unit</th>
              <th style={{ textAlign: "right" }}>Records</th>
            </tr>
          </thead>
          <tbody>
            {data.units.map((u) => (
              <tr key={u.name}>
                <td>{u.name}</td>
                <td style={{ textAlign: "right" }}>{u.records}</td>
              </tr>
            ))}
            {data.units.length === 0 && (
              <tr>
                <td colSpan={2} style={{ color: "var(--slate)", textAlign: "center" }}>
                  No data loaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
