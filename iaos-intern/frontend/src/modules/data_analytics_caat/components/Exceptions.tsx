import { useState } from "react";

const data = [
  {
    dataset: "Payroll.xlsx",
    rule: "Duplicate Employee",
    severity: "High",
    owner: "Rajesh",
    status: "Open",
    date: "15-Jul-2026",
  },
  {
    dataset: "Vendor.csv",
    rule: "Duplicate Vendor",
    severity: "Medium",
    owner: "HS",
    status: "Resolved",
    date: "14-Jul-2026",
  },
  {
    dataset: "Invoices.xlsx",
    rule: "Missing Invoice",
    severity: "High",
    owner: "Admin",
    status: "Open",
    date: "13-Jul-2026",
  },
  {
    dataset: "Journal.xlsx",
    rule: "Benford Failure",
    severity: "Low",
    owner: "Audit Team",
    status: "Open",
    date: "12-Jul-2026",
  },
];

export default function Exceptions() {
  const [search, setSearch] = useState("");

  const rows = data.filter(
    (d) =>
      d.dataset.toLowerCase().includes(search.toLowerCase()) ||
      d.rule.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <h2>Audit Exceptions</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Review exceptions detected by audit analytics.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          gap: 10,
        }}
      >

        <input
          placeholder="Search exceptions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        />

        <button className="primary-btn">
          Export
        </button>

      </div>

      <div className="caat-section">

        <table>

          <thead>

            <tr>
              <th>Dataset</th>
              <th>Rule</th>
              <th>Severity</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Date</th>
            </tr>

          </thead>

          <tbody>

            {rows.map((r, i) => (

              <tr key={i}>

                <td>{r.dataset}</td>

                <td>{r.rule}</td>

                <td>

                  <span
                    className={
                      r.severity === "High"
                        ? "badge-red"
                        : r.severity === "Medium"
                        ? "badge-yellow"
                        : "badge-green"
                    }
                  >
                    {r.severity}
                  </span>

                </td>

                <td>{r.owner}</td>

                <td>{r.status}</td>

                <td>{r.date}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}