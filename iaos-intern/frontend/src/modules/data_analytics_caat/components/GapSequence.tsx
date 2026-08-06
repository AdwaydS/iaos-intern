import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const gaps = [
  { invoice: "1001", status: "Found" },
  { invoice: "1002", status: "Found" },
  { invoice: "1003", status: "Missing" },
  { invoice: "1004", status: "Found" },
  { invoice: "1005", status: "Found" },
  { invoice: "1006", status: "Missing" },
];

const trend = [
  { month: "Jan", gaps: 12 },
  { month: "Feb", gaps: 8 },
  { month: "Mar", gaps: 15 },
  { month: "Apr", gaps: 5 },
  { month: "May", gaps: 9 },
  { month: "Jun", gaps: 4 },
];

export default function GapSequence() {
  return (
    <div>

      <h2>Gap & Sequence Testing</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Detect missing invoice, cheque and voucher sequences.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18</h2>
          <span>Missing Numbers</span>
        </div>

        <div className="caat-card">
          <h2>7</h2>
          <span>Duplicate Sequences</span>
        </div>

        <div className="caat-card">
          <h2>99.4%</h2>
          <span>Sequence Integrity</span>
        </div>

      </div>

      <div className="caat-section">

        <h2>Gap Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="gaps"
              stroke="#1D4ED8"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      <div className="caat-section">

        <h2>Missing Sequences</h2>

        <table>

          <thead>
            <tr>
              <th>Invoice</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {gaps.map((g) => (
              <tr key={g.invoice}>
                <td>{g.invoice}</td>
                <td>{g.status}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}