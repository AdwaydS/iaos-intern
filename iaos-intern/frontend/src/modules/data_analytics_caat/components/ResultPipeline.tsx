import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const status = [
  { name: "Open", value: 22 },
  { name: "Assigned", value: 14 },
  { name: "Closed", value: 8 },
];

const colors = ["#2563EB", "#F59E0B", "#22C55E"];

const findings = [
  {
    id: "OBS-001",
    rule: "Duplicate Vendor",
    severity: "High",
    owner: "Finance",
    status: "Open",
  },
  {
    id: "OBS-002",
    rule: "Benford Alert",
    severity: "Medium",
    owner: "Audit",
    status: "Assigned",
  },
  {
    id: "OBS-003",
    rule: "Missing Invoice",
    severity: "High",
    owner: "Procurement",
    status: "Closed",
  },
];

export default function ResultPipeline() {
  return (
    <div>

      <h2>Result-to-Finding Pipeline</h2>

      <p style={{color:"var(--slate)",marginBottom:20}}>
        Convert analytics results into formal audit observations.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>44</h2>
          <span>Exceptions</span>
        </div>

        <div className="caat-card">
          <h2>31</h2>
          <span>Observations</span>
        </div>

        <div className="caat-card">
          <h2>18</h2>
          <span>Findings</span>
        </div>

        <div className="caat-card">
          <h2>86%</h2>
          <span>Converted</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Pipeline Status</h3>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={status}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
              >

                {status.map((_, i) => (
                  <Cell
                    key={i}
                    fill={colors[i]}
                  />
                ))}

              </Pie>

              <Tooltip/>

            </PieChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Generated Findings</h3>

          <table>

            <thead>

              <tr>
                <th>ID</th>
                <th>Rule</th>
                <th>Severity</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {findings.map((f)=>(
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{f.rule}</td>
                  <td>{f.severity}</td>
                  <td>{f.owner}</td>
                  <td>{f.status}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}