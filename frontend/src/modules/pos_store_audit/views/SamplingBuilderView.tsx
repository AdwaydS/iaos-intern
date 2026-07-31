import { useState } from "react";

export default function SamplingBuilderView() {
  const [samples] = useState([
    { code: "SMP-POS-01", population: "Daily POS-to-Bank Reconciliation records (Jan–Mar)", method: "Monetary Unit Sampling", size: "40 transactions", status: "Ready" },
    { code: "SMP-POS-02", population: "Discount override transactions > 10%", method: "Judgmental Sampling", size: "25 transactions", status: "In Progress" },
    { code: "SMP-POS-03", population: "Cashier shift cash variance records", method: "Stratified Sampling", size: "30 shifts", status: "Ready" },
    { code: "SMP-POS-04", population: "Void/Refund transactions across all stores", method: "Random Sampling", size: "50 transactions", status: "Pending" },
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="card" style={{ padding: 22 }}>
        <h3 style={{ color: "var(--navy)", marginBottom: 12 }}>Sampling Builder</h3>
        <p style={{ color: "var(--slate)" }}>
          Audit sampling plans and methodologies for substantive testing of POS & Store operations.
        </p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Sample Code</th>
              <th>Population Description</th>
              <th>Sampling Method</th>
              <th>Sample Size</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.code}>
                <td><strong>{s.code}</strong></td>
                <td>{s.population}</td>
                <td>{s.method}</td>
                <td>{s.size}</td>
                <td>
                  <span className={`badge ${s.status === "Ready" ? "badge-success" : s.status === "In Progress" ? "badge-gold" : "badge-slate"}`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
