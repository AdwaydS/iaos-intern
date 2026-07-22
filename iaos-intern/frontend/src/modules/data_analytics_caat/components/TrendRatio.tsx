import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const trend = [
  { month: "Jan", revenue: 82, expense: 65 },
  { month: "Feb", revenue: 88, expense: 70 },
  { month: "Mar", revenue: 91, expense: 73 },
  { month: "Apr", revenue: 95, expense: 76 },
  { month: "May", revenue: 99, expense: 81 },
  { month: "Jun", revenue: 104, expense: 85 },
];

const ratios = [
  { name: "Gross Margin", value: 41 },
  { name: "Operating", value: 28 },
  { name: "Current", value: 65 },
  { name: "Quick", value: 49 },
];

const variance = [
  {
    unit: "Manufacturing",
    expected: "18%",
    actual: "22%",
    variance: "+4%",
  },
  {
    unit: "Sales",
    expected: "15%",
    actual: "13%",
    variance: "-2%",
  },
  {
    unit: "HR",
    expected: "9%",
    actual: "10%",
    variance: "+1%",
  },
  {
    unit: "Finance",
    expected: "12%",
    actual: "12%",
    variance: "0%",
  },
];

export default function TrendRatio() {
  return (
    <div>

      <h2>Trend & Ratio Analytics</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Analyze financial ratios and period-over-period trends.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18%</h2>
          <span>Revenue Growth</span>
        </div>

        <div className="caat-card">
          <h2>41%</h2>
          <span>Gross Margin</span>
        </div>

        <div className="caat-card">
          <h2>13%</h2>
          <span>Operating Margin</span>
        </div>

        <div className="caat-card">
          <h2>1.82</h2>
          <span>Current Ratio</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Monthly Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="revenue" stroke="#1D4ED8" />
              <Line dataKey="expense" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Ratio Comparison</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1D4ED8" />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="caat-section">

        <h3>Business Unit Variance</h3>

        <table>

          <thead>
            <tr>
              <th>Business Unit</th>
              <th>Expected</th>
              <th>Actual</th>
              <th>Variance</th>
            </tr>
          </thead>

          <tbody>

            {variance.map((row) => (
              <tr key={row.unit}>
                <td>{row.unit}</td>
                <td>{row.expected}</td>
                <td>{row.actual}</td>
                <td>{row.variance}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}