import { Target } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const sampleData = [
  { type: "Random", count: 120 },
  { type: "MUS", count: 95 },
  { type: "Systematic", count: 80 },
  { type: "Stratified", count: 65 },
  { type: "Judgmental", count: 45 },
];

export default function SamplingBuilder() {
  return (
    <>
      <h2>Audit Sampling Builder</h2>

      <p className="subtitle">
        Build statistical and judgmental audit samples.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <Target className="icon" />
          <h2>512</h2>
          <span>Total Samples</span>
        </div>

        <div className="caat-card">
          <h2>5</h2>
          <span>Sampling Methods</span>
        </div>

        <div className="caat-card">
          <h2>98%</h2>
          <span>Coverage</span>
        </div>

        <div className="caat-card">
          <h2>124</h2>
          <span>High Risk Items</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="caat-section">

          <h2>Sampling Methods</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="caat-section">

          <h2>Sampling Rules</h2>

          <ul>
            <li>Random Sampling</li>
            <li>Monetary Unit Sampling (MUS)</li>
            <li>Systematic Sampling</li>
            <li>Stratified Sampling</li>
            <li>Judgmental Sampling</li>
          </ul>

          <br />

          <button className="primary-btn">
            Create New Sample
          </button>

        </div>

      </div>

      <div className="caat-section">

        <h2>Recent Sampling Jobs</h2>

        <table>

          <thead>

            <tr>
              <th>ID</th>
              <th>Method</th>
              <th>Population</th>
              <th>Sample Size</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            <tr>
              <td>SP001</td>
              <td>Random</td>
              <td>12,450</td>
              <td>150</td>
              <td>Completed</td>
            </tr>

            <tr>
              <td>SP002</td>
              <td>MUS</td>
              <td>8,900</td>
              <td>120</td>
              <td>Completed</td>
            </tr>

            <tr>
              <td>SP003</td>
              <td>Systematic</td>
              <td>5,430</td>
              <td>90</td>
              <td>Running</td>
            </tr>

            <tr>
              <td>SP004</td>
              <td>Judgmental</td>
              <td>2,140</td>
              <td>55</td>
              <td>Draft</td>
            </tr>

          </tbody>

        </table>

      </div>

    </>
  );
}