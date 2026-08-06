import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const scatterData = [
  { amount: 1200, score: 10 },
  { amount: 2500, score: 25 },
  { amount: 3200, score: 30 },
  { amount: 4800, score: 60 },
  { amount: 5100, score: 80 },
  { amount: 7200, score: 95 },
  { amount: 8500, score: 99 },
];

const riskData = [
  { level: "Low", value: 62 },
  { level: "Medium", value: 24 },
  { level: "High", value: 11 },
  { level: "Critical", value: 3 },
];

const anomalies = [
  {
    id: "TXN1001",
    vendor: "ABC Suppliers",
    amount: "₹8,42,000",
    score: "98%",
    risk: "Critical",
  },
  {
    id: "TXN1045",
    vendor: "XYZ Logistics",
    amount: "₹5,13,000",
    score: "94%",
    risk: "High",
  },
  {
    id: "TXN1108",
    vendor: "Global Metals",
    amount: "₹3,25,000",
    score: "88%",
    risk: "Medium",
  },
];

export default function OutlierModels() {
  return (
    <div>

      <h2>Outlier & Anomaly Models</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 24,
        }}
      >
        AI-powered anomaly detection for suspicious transactions.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18,540</h2>
          <span>Total Transactions</span>
        </div>

        <div className="caat-card">
          <h2>312</h2>
          <span>Anomalies</span>
        </div>

        <div className="caat-card">
          <h2>41</h2>
          <span>High Risk</span>
        </div>

        <div className="caat-card">
          <h2>92%</h2>
          <span>Average Confidence</span>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >

        <div className="caat-section">

          <h2>Anomaly Scatter Plot</h2>

          <ResponsiveContainer width="100%" height={300}>

            <ScatterChart>

              <CartesianGrid />

              <XAxis dataKey="amount" />

              <YAxis dataKey="score" />

              <Tooltip />

              <Scatter
                data={scatterData}
                fill="#2563EB"
              />

            </ScatterChart>

          </ResponsiveContainer>

        </div>

        <div className="caat-section">

          <h2>Risk Distribution</h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={riskData}>

              <CartesianGrid />

              <XAxis dataKey="level" />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="value"
                fill="#2563EB"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      <div className="caat-section">

        <h2>Top Suspicious Transactions</h2>

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Vendor</th>

              <th>Amount</th>

              <th>AI Score</th>

              <th>Risk</th>

            </tr>

          </thead>

          <tbody>

            {anomalies.map((row) => (

              <tr key={row.id}>

                <td>{row.id}</td>

                <td>{row.vendor}</td>

                <td>{row.amount}</td>

                <td>{row.score}</td>

                <td>{row.risk}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}