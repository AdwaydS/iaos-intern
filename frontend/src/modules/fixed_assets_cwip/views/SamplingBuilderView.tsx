import { useState } from "react";

export default function SamplingBuilderView() {
  const [populations] = useState([
    { id: "POP-FA-01", name: "Total Fixed Assets (> ₹1L)", populationSize: 1842, sampleSize: 120, method: "Stratified Random", criteria: "By asset class & value band" },
    { id: "POP-FA-02", name: "CWIP Projects (All)", populationSize: 18, sampleSize: 18, method: "Census", criteria: "100% coverage" },
    { id: "POP-FA-03", name: "Disposals FY 2025-26", populationSize: 47, sampleSize: 25, method: "Directed", criteria: "High-value & related party" },
    { id: "POP-FA-04", name: "Idle Assets (> 180 days)", populationSize: 34, sampleSize: 20, method: "Random", criteria: "Risk-based selection" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Sampling & Population Builder</h3>
        <p style={{ color: "var(--slate)" }}>
          Defines audit populations, sampling methodology, and sample sizes for each fixed asset audit assertion.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Population ID</th>
              <th>Population Name</th>
              <th>Total Items</th>
              <th>Sample Size</th>
              <th>Method</th>
              <th>Selection Criteria</th>
            </tr>
          </thead>
          <tbody>
            {populations.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.id}</strong></td>
                <td>{p.name}</td>
                <td>{p.populationSize.toLocaleString()}</td>
                <td>{p.sampleSize}</td>
                <td>{p.method}</td>
                <td style={{ fontSize: 12, color: "var(--slate)" }}>{p.criteria}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
