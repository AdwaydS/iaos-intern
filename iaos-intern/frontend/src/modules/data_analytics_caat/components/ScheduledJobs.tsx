import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const weekly = [
  { day: "Mon", jobs: 6 },
  { day: "Tue", jobs: 9 },
  { day: "Wed", jobs: 7 },
  { day: "Thu", jobs: 11 },
  { day: "Fri", jobs: 8 },
];

const jobs = [
  {
    name: "Duplicate Vendor",
    schedule: "Daily 09:00",
    owner: "Audit",
    status: "Running",
  },
  {
    name: "Benford Analysis",
    schedule: "Weekly",
    owner: "Finance",
    status: "Scheduled",
  },
  {
    name: "Invoice Gap",
    schedule: "Monthly",
    owner: "AP",
    status: "Paused",
  },
];

export default function ScheduledJobs() {

  return (

    <div>

      <h2>Scheduled Analytics Jobs</h2>

      <p
        style={{
          color:"var(--slate)",
          marginBottom:20,
        }}
      >
        Automate recurring CAAT analytics execution.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>18</h2>
          <span>Scheduled Jobs</span>
        </div>

        <div className="caat-card">
          <h2>12</h2>
          <span>Running</span>
        </div>

        <div className="caat-card">
          <h2>4</h2>
          <span>Paused</span>
        </div>

        <div className="caat-card">
          <h2>97%</h2>
          <span>Success Rate</span>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Weekly Execution</h3>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart data={weekly}>

              <CartesianGrid strokeDasharray="3 3"/>

              <XAxis dataKey="day"/>

              <YAxis/>

              <Tooltip/>

              <Bar
                dataKey="jobs"
                fill="#2563EB"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Scheduled Jobs</h3>

          <table>

            <thead>

              <tr>
                <th>Job</th>
                <th>Schedule</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              {jobs.map((job)=>(
                <tr key={job.name}>
                  <td>{job.name}</td>
                  <td>{job.schedule}</td>
                  <td>{job.owner}</td>
                  <td>{job.status}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}