import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Scope { auditable_entities: string[]; active_schemes: string[]; module_name: string; }

export default function Scope() {
  const [data, setData] = useState<Scope | null>(null);
  useEffect(() => { get<Scope>(`/api/modules/${SLUG}/scope`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Auditable Entities</h3>
        {data.auditable_entities.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No entities registered yet.</p>
        ) : (
          <ul>{data.auditable_entities.map((e) => <li key={e} style={{ padding: "4px 0" }}>{e}</li>)}</ul>
        )}
      </div>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Active Schemes</h3>
        {data.active_schemes.length === 0 ? (
          <p style={{ color: "var(--slate)" }}>No active schemes.</p>
        ) : (
          <ul>{data.active_schemes.map((s) => <li key={s} style={{ padding: "4px 0" }}>{s}</li>)}</ul>
        )}
      </div>
    </div>
  );
}
