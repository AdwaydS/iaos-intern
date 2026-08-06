import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const summary = [
  { name: "Unique", value: 96 },
  { name: "Duplicate", value: 4 },
];

const COLORS = ["#22C55E", "#EF4444"];

const duplicates = [
  {
    id: "EMP1001",
    name: "John Smith",
    field: "Employee ID",
    confidence: "100%",
  },
  {
    id: "EMP1023",
    name: "David Miller",
    field: "Email",
    confidence: "98%",
  },
  {
    id: "EMP1038",
    name: "Sarah Wilson",
    field: "Bank Account",
    confidence: "95%",
  },
];

export default function DuplicateDetection() {
  return (
    <div>

      <h2>Duplicate Detection</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Detect duplicate master records across uploaded datasets.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18,540</h2>
          <span>Total Records</span>
        </div>

        <div className="caat-card">
          <h2>742</h2>
          <span>Duplicates</span>
        </div>

        <div className="caat-card">
          <h2>4%</h2>
          <span>Duplicate Rate</span>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 25,
          marginTop: 30,
        }}
      >

        <div className="caat-section">

          <h2>Duplicate Ratio</h2>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <PieChart>

              <Pie
                data={summary}
                dataKey="value"
                outerRadius={90}
                label
              >
                {summary.map((_, i) => (
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

        <div className="caat-section">

          <h2>Detected Duplicates</h2>

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Matched Field</th>
                <th>Confidence</th>
              </tr>

            </thead>

            <tbody>

              {duplicates.map((row) => (

                <tr key={row.id}>

                  <td>{row.id}</td>

                  <td>{row.name}</td>

                  <td>{row.field}</td>

                  <td>{row.confidence}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}