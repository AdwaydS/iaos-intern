import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  FaDatabase,
  FaChartBar,
  FaRobot,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";

const cards = [
  {
    title: "Datasets",
    value: 12,
    icon: <FaDatabase />,
  },
  {
    title: "Records Imported",
    value: "18,540",
    icon: <FaChartBar />,
  },
  {
    title: "Analytics Scripts",
    value: 26,
    icon: <FaRobot />,
  },
  {
    title: "Exceptions",
    value: 41,
    icon: <FaExclamationTriangle />,
  },
  {
    title: "Data Quality",
    value: "97%",
    icon: <FaCheckCircle />,
  },
  {
    title: "Scheduled Jobs",
    value: 8,
    icon: <FaCalendarAlt />,
  },
];

const monthlyData = [
  { month: "Jan", imports: 1200 },
  { month: "Feb", imports: 1800 },
  { month: "Mar", imports: 2200 },
  { month: "Apr", imports: 2600 },
  { month: "May", imports: 3000 },
  { month: "Jun", imports: 3400 },
];

const pieData = [
  { name: "Duplicate", value: 35 },
  { name: "Missing", value: 25 },
  { name: "Invalid", value: 20 },
  { name: "Fraud", value: 20 },
];

const COLORS = [
  "#0B1F3A",
  "#B8862B",
  "#22C55E",
  "#EF4444",
];

export default function Dashboard() {
  return (
    <>
      <div className="caat-grid">
        {cards.map((c) => (
          <div className="caat-card" key={c.title}>
            <div className="icon">{c.icon}</div>
            <h2>{c.value}</h2>
            <span>{c.title}</span>
          </div>
        ))}
      </div>

      <div className="chart-grid">

        <div className="caat-section">
          <h2>Monthly Data Imports</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="imports"
                stroke="#0B1F3A"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        <div className="caat-section">
          <h2>Exception Categories</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {pieData.map((e, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                  />
                ))}
              </Pie>

              <Tooltip />

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="table-grid">

        <div className="caat-section">

          <h2>Recent Exceptions</h2>

          <table>

            <thead>

              <tr>

                <th>Dataset</th>

                <th>Rule</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>Vendor Master</td>

                <td>Duplicate Vendor</td>

                <td>Open</td>

              </tr>

              <tr>

                <td>Payroll</td>

                <td>Negative Salary</td>

                <td>Closed</td>

              </tr>

            </tbody>

          </table>

        </div>

        <div className="caat-section">

          <h2>AI Audit Insights</h2>

          <ul>

            <li>97% Data Quality Score</li>

            <li>18% duplicate vendors reduced</li>

            <li>Payroll anomalies detected</li>

            <li>Run Benford Analysis this week</li>

            <li>3 scheduled jobs pending</li>

          </ul>

        </div>

      </div>

    </>
  );
}