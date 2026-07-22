import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const jobs = [
  { time: "09:00", running: 2 },
  { time: "10:00", running: 4 },
  { time: "11:00", running: 6 },
  { time: "12:00", running: 5 },
  { time: "13:00", running: 7 },
  { time: "14:00", running: 3 },
];

const alerts = [
  {
    job: "Payroll Validation",
    status: "Running",
    progress: "76%",
  },
  {
    job: "Vendor Duplicate Check",
    status: "Completed",
    progress: "100%",
  },
  {
    job: "Benford Analysis",
    status: "Queued",
    progress: "0%",
  },
];

export default function Monitoring() {
  return (
    <div>

      <h2>Continuous Monitoring</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Track audit analytics execution in real time.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18</h2>
          <span>Running Jobs</span>
        </div>

        <div className="caat-card">
          <h2>96%</h2>
          <span>Success Rate</span>
        </div>

        <div className="caat-card">
          <h2>3</h2>
          <span>Pending Alerts</span>
        </div>

      </div>

      <div className="caat-section">

        <h2>Job Activity</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={jobs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time"/>
            <YAxis/>
            <Tooltip/>
            <Line
              type="monotone"
              dataKey="running"
              stroke="#1D4ED8"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      <div className="caat-section">

        <h2>Current Jobs</h2>

        <table>

          <thead>

            <tr>
              <th>Job</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>

          </thead>

          <tbody>

            {alerts.map((job) => (

              <tr key={job.job}>

                <td>{job.job}</td>

                <td>{job.status}</td>

                <td>{job.progress}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}