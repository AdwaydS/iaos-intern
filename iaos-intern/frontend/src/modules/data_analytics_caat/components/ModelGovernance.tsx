import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const versions = [
  { name: "v1", models: 3 },
  { name: "v2", models: 5 },
  { name: "v3", models: 7 },
  { name: "v4", models: 11 },
];

const models = [
  {
    name: "Benford Model",
    version: "v4",
    owner: "Audit",
    status: "Approved",
  },
  {
    name: "Duplicate Detection",
    version: "v3",
    owner: "Finance",
    status: "Approved",
  },
  {
    name: "Outlier Detection",
    version: "v2",
    owner: "Analytics",
    status: "Validation",
  },
];

export default function ModelGovernance() {
  return (
    <div>

      <h2>Model Governance & Validation</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Manage model versions, validation and approvals.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>19</h2>
          <span>Models</span>
        </div>

        <div className="caat-card">
          <h2>14</h2>
          <span>Approved</span>
        </div>

        <div className="caat-card">
          <h2>3</h2>
          <span>Pending Validation</span>
        </div>

        <div className="caat-card">
          <h2>98%</h2>
          <span>Accuracy</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Model Versions</h3>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={versions}>

              <XAxis dataKey="name"/>

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="models"
                fill="#2563EB"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Registered Models</h3>

          <table>

            <thead>

              <tr>
                <th>Model</th>
                <th>Version</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {models.map((m)=>(
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.version}</td>
                  <td>{m.owner}</td>
                  <td>{m.status}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}