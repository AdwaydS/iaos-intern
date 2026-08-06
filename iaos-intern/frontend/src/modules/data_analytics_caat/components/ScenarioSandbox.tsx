import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const execution = [
  { name: "Pass", value: 26 },
  { name: "Warning", value: 8 },
  { name: "Failed", value: 4 },
];

const history = [
  {
    script: "Duplicate Vendor Detection",
    user: "Rajesh",
    status: "Success",
    time: "2 min ago",
  },
  {
    script: "Benford Analysis",
    user: "HS",
    status: "Success",
    time: "10 min ago",
  },
  {
    script: "Payroll Validation",
    user: "Admin",
    status: "Failed",
    time: "25 min ago",
  },
];

export default function ScenarioSandbox() {
  return (
    <div>

      <h2>Scenario Scripting Sandbox</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Write, test and execute custom audit analytics safely.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>38</h2>
          <span>Scripts</span>
        </div>

        <div className="caat-card">
          <h2>91%</h2>
          <span>Success Rate</span>
        </div>

        <div className="caat-card">
          <h2>14</h2>
          <span>Saved Queries</span>
        </div>

        <div className="caat-card">
          <h2>3</h2>
          <span>Running Jobs</span>
        </div>

      </div>

      <div className="caat-section">

        <h3>Script Editor</h3>

        <textarea
          rows={10}
          style={{
            width: "100%",
            fontFamily: "monospace",
            padding: 15,
          }}
          defaultValue={`SELECT VendorName,
SUM(Amount)
FROM Payments
GROUP BY VendorName
HAVING SUM(Amount) > 100000;`}
        />

        <div
          style={{
            marginTop: 15,
            display: "flex",
            gap: 10,
          }}
        >
          <button>Run Script</button>
          <button>Save</button>
          <button>Validate</button>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Execution Results</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={execution}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="value" fill="#1D4ED8"/>
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Recent Executions</h3>

          <table>

            <thead>
              <tr>
                <th>Script</th>
                <th>User</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>

              {history.map((row) => (

                <tr key={row.script}>

                  <td>{row.script}</td>
                  <td>{row.user}</td>
                  <td>{row.status}</td>
                  <td>{row.time}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}