import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface Rule {
  id: string;
  rule: string;
  threshold: string;
  action: string;
}
interface Rules {
  rules: Rule[];
  total_rules: number;
}

export default function Analytics() {
  const [data, setData] = useState<Rules | null>(null);
  useEffect(() => {
    get<Rules>(`/api/modules/${SLUG}/analytics-rules`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Rule</th>
              <th>Threshold</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.rules.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.rule}</td>
                <td>
                  <span className="badge badge-gold">{r.threshold}</span>
                </td>
                <td>{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 12, color: "var(--slate)", fontSize: 13 }}>
        Configured CAAT rules: {data.total_rules}
      </p>
    </div>
  );
}
