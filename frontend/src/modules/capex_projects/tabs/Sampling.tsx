import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "capex_projects";

interface Item {
  afe_no: string;
  project_name: string;
  amount: number;
}
interface Sampling {
  population_size: number;
  sample_method: string;
  sample_size: number;
  population: Item[];
}

export default function Sampling() {
  const [data, setData] = useState<Sampling | null>(null);
  useEffect(() => {
    get<Sampling>(`/api/modules/${SLUG}/sampling`).then(setData);
  }, []);

  if (!data) return <p>Loading...</p>;

  const sample = data.population.slice(0, data.sample_size);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.population_size}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Population (AFEs)</div>
        </div>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.sample_size}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Sample Size</div>
        </div>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--navy)" }}>{data.sample_method}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Method</div>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>AFE No</th>
              <th>Project</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th>In Sample</th>
            </tr>
          </thead>
          <tbody>
            {data.population.map((p) => {
              const inSample = sample.includes(p);
              return (
                <tr key={p.afe_no}>
                  <td>{p.afe_no}</td>
                  <td>{p.project_name}</td>
                  <td style={{ textAlign: "right" }}>{p.amount.toLocaleString()}</td>
                  <td>
                    {inSample ? (
                      <span className="badge badge-success">Yes</span>
                    ) : (
                      <span className="badge badge-slate">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.population.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--slate)", textAlign: "center" }}>
                  No AFEs to sample from yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
