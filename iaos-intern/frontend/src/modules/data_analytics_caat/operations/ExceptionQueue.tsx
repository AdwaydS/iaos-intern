import { AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { name: "Open", value: 18 },
  { name: "Assigned", value: 10 },
  { name: "Closed", value: 8 },
];

const COLORS = ["#2563eb", "#f59e0b", "#16a34a"];

export default function ExceptionQueue() {
  return (
    <>
      <h2>Exception & Red-Flag Queue</h2>
      <p className="subtitle">
        Review and manage system-generated audit exceptions.
      </p>

      <div className="caat-grid">
        <div className="caat-card">
          <AlertTriangle className="icon" />
          <h2>36</h2>
          <span>Total Exceptions</span>
        </div>

        <div className="caat-card">
          <h2>18</h2>
          <span>Open</span>
        </div>

        <div className="caat-card">
          <h2>10</h2>
          <span>Assigned</span>
        </div>

        <div className="caat-card">
          <h2>8</h2>
          <span>Closed</span>
        </div>
      </div>

      <div className="chart-grid">

        <div className="caat-section">

          <h2>Exception Queue</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Rule</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>EX001</td>
                <td>Duplicate Vendor</td>
                <td>High</td>
                <td>Open</td>
              </tr>

              <tr>
                <td>EX002</td>
                <td>Invoice Gap</td>
                <td>Medium</td>
                <td>Assigned</td>
              </tr>

              <tr>
                <td>EX003</td>
                <td>Weekend Posting</td>
                <td>High</td>
                <td>Closed</td>
              </tr>
            </tbody>
          </table>

        </div>

        <div className="caat-section">

          <h2>Status</h2>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} dataKey="value">
                {data.map((e, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>
    </>
  );
}