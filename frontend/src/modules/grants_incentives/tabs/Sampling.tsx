import { useEffect, useState } from "react";
import { get } from "../../../lib/api";

const SLUG = "grants_incentives";

interface Samp { population_size: number; sample_method: string; sample_size: number; population: { claim_ref: string; amount: number }[]; }

export default function Sampling() {
  const [data, setData] = useState<Samp | null>(null);
  useEffect(() => { get<Samp>(`/api/modules/${SLUG}/sampling`).then(setData); }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.population_size}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Population Size</div>
        </div>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.sample_size}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Sample Size</div>
        </div>
        <div className="card" style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--navy)" }}>{data.sample_method}</div>
          <div style={{ color: "var(--slate)", fontSize: 13 }}>Method</div>
        </div>
      </div>
      {data.population.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead><tr><th>Claim Ref</th><th>Amount</th></tr></thead>
            <tbody>
              {data.population.map((p) => (
                <tr key={p.claim_ref}><td>{p.claim_ref}</td><td>{p.amount.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
