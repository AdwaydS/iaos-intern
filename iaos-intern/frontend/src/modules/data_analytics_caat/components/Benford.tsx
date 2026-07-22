import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { digit: "1", expected: 30.1, actual: 28 },
  { digit: "2", expected: 17.6, actual: 19 },
  { digit: "3", expected: 12.5, actual: 13 },
  { digit: "4", expected: 9.7, actual: 11 },
  { digit: "5", expected: 7.9, actual: 8 },
  { digit: "6", expected: 6.7, actual: 7 },
  { digit: "7", expected: 5.8, actual: 5 },
  { digit: "8", expected: 5.1, actual: 4 },
  { digit: "9", expected: 4.6, actual: 5 },
];

export default function Benford() {
  return (
    <div>

      <h2>Benford Analysis</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Compare expected and actual first-digit frequencies.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>97%</h2>
          <span>Compliance</span>
        </div>

        <div className="caat-card">
          <h2>3.2%</h2>
          <span>Deviation</span>
        </div>

        <div className="caat-card">
          <h2>Low</h2>
          <span>Fraud Risk</span>
        </div>

      </div>

      <div
        className="caat-section"
        style={{ marginTop: 30 }}
      >

        <h2>Digit Distribution</h2>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="digit" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="expected"
              fill="#0f172a"
              name="Expected"
            />

            <Bar
              dataKey="actual"
              fill="#2563eb"
              name="Actual"
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

      <div
        className="caat-section"
        style={{ marginTop: 30 }}
      >

        <h2>Suspicious Digits</h2>

        <table>

          <thead>
            <tr>
              <th>Digit</th>
              <th>Expected %</th>
              <th>Actual %</th>
              <th>Deviation</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td>4</td>
              <td>9.7</td>
              <td>11</td>
              <td>+1.3%</td>
            </tr>

            <tr>
              <td>8</td>
              <td>5.1</td>
              <td>4</td>
              <td>-1.1%</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}