import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#1D4ED8",
  "#10B981",
  "#F59E0B",
];

const riskData = [
  { name: "High", value: 16 },
  { name: "Medium", value: 34 },
  { name: "Low", value: 50 },
];

const links = [
  {
    source: "Employee HR001",
    target: "Vendor ABC Ltd",
    relation: "Shared Address",
    risk: "High",
  },
  {
    source: "Vendor ABC Ltd",
    target: "Bank A/C 4588",
    relation: "Shared Bank Account",
    risk: "High",
  },
  {
    source: "Employee FIN102",
    target: "Vendor Delta",
    relation: "Family Relationship",
    risk: "Medium",
  },
  {
    source: "Vendor Omega",
    target: "Invoice INV-2209",
    relation: "Duplicate Invoice",
    risk: "Medium",
  },
];

const queue = [
  {
    case: "Vendor Duplicate",
    status: "Open",
  },
  {
    case: "Conflict of Interest",
    status: "Escalated",
  },
  {
    case: "Shared Bank Account",
    status: "Under Review",
  },
];

export default function NetworkAnalysis() {
  return (
    <div>

      <h2>Network / Link Analysis</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Discover hidden relationships between employees, vendors and transactions.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>1,284</h2>
          <span>Nodes</span>
        </div>

        <div className="caat-card">
          <h2>4,286</h2>
          <span>Relationships</span>
        </div>

        <div className="caat-card">
          <h2>62</h2>
          <span>High Risk Links</span>
        </div>

        <div className="caat-card">
          <h2>327</h2>
          <span>Connected Entities</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Relationship Map</h3>

          <div
            style={{
              padding: 40,
              textAlign: "center",
              lineHeight: 2,
            }}
          >

            <strong>Employee HR001</strong>

            <br />

            │

            <br />

            Vendor ABC Ltd

            <br />

            ├───────────────┐

            <br />

            │

            │

            <br />

            Bank Account

            Invoice INV-1002

          </div>

        </div>

        <div className="chart-card">

          <h3>Risk Distribution</h3>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={riskData}
                dataKey="value"
                outerRadius={90}
              >

                {riskData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                  />
                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className="caat-section">

        <h3>Suspicious Relationships</h3>

        <table>

          <thead>

            <tr>
              <th>Source</th>
              <th>Target</th>
              <th>Relationship</th>
              <th>Risk</th>
            </tr>

          </thead>

          <tbody>

            {links.map((row) => (

              <tr key={row.source + row.target}>

                <td>{row.source}</td>
                <td>{row.target}</td>
                <td>{row.relation}</td>
                <td>{row.risk}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="caat-section">

        <h3>Investigation Queue</h3>

        <table>

          <thead>

            <tr>
              <th>Case</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {queue.map((row) => (

              <tr key={row.case}>

                <td>{row.case}</td>
                <td>{row.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}