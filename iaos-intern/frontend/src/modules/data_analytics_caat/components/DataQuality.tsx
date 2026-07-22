import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaDatabase,
  FaFilter,
} from "react-icons/fa";

const qualityData = [
  { name: "Valid", value: 92 },
  { name: "Duplicates", value: 4 },
  { name: "Missing", value: 3 },
  { name: "Invalid", value: 1 },
];

const COLORS = [
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#0f172a",
];

const trend = [
  { month: "Jan", score: 86 },
  { month: "Feb", score: 88 },
  { month: "Mar", score: 90 },
  { month: "Apr", score: 92 },
  { month: "May", score: 95 },
  { month: "Jun", score: 97 },
];

export default function DataQuality() {
  return (
    <div>

      <h2 style={{ marginBottom: 8 }}>Data Quality Assessment</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Evaluate imported datasets for completeness,
        duplicates and integrity.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <FaCheckCircle size={28} />
          <h2>97%</h2>
          <span>Quality Score</span>
        </div>

        <div className="caat-card">
          <FaDatabase size={28} />
          <h2>18,540</h2>
          <span>Total Records</span>
        </div>

        <div className="caat-card">
          <FaFilter size={28} />
          <h2>4%</h2>
          <span>Duplicates</span>
        </div>

        <div className="caat-card">
          <FaExclamationTriangle size={28} />
          <h2>128</h2>
          <span>Exceptions</span>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 25,
          marginTop: 30,
        }}
      >

        <div className="caat-section">

          <h2>Quality Trend</h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={trend}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis />

              <Tooltip />

              <Bar dataKey="score" fill="#0f172a" />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="caat-section">

          <h2>Quality Breakdown</h2>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={qualityData}
                dataKey="value"
                outerRadius={95}
                label
              >
                {qualityData.map((_, i) => (
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

      <div
        className="caat-section"
        style={{ marginTop: 30 }}
      >

        <h2>Dataset Quality Report</h2>

        <table>

          <thead>

            <tr>
              <th>Dataset</th>
              <th>Rows</th>
              <th>Missing</th>
              <th>Duplicate</th>
              <th>Score</th>
            </tr>

          </thead>

          <tbody>

            <tr>
              <td>Payroll.xlsx</td>
              <td>4210</td>
              <td>2%</td>
              <td>1%</td>
              <td>98%</td>
            </tr>

            <tr>
              <td>Vendor.csv</td>
              <td>8441</td>
              <td>5%</td>
              <td>4%</td>
              <td>94%</td>
            </tr>

            <tr>
              <td>Invoices.xlsx</td>
              <td>5889</td>
              <td>3%</td>
              <td>2%</td>
              <td>96%</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}