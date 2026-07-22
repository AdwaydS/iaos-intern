import {
  ResponsiveContainer,
  BarChart,
  Bar,
 CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const jobs = [
  { day: "Mon", jobs: 5 },
  { day: "Tue", jobs: 8 },
  { day: "Wed", jobs: 6 },
  { day: "Thu", jobs: 10 },
  { day: "Fri", jobs: 7 },
];

const schedule = [
  {
    name: "Payroll Validation",
    frequency: "Daily",
    next: "16 Jul 09:00",
    status: "Active",
  },
  {
    name: "Benford Analysis",
    frequency: "Weekly",
    next: "18 Jul 10:00",
    status: "Active",
  },
  {
    name: "Duplicate Detection",
    frequency: "Monthly",
    next: "01 Aug",
    status: "Paused",
  },
];

export default function Scheduler() {
  return (
    <div>

      <h2>Job Scheduler</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Configure recurring CAAT jobs.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>8</h2>
          <span>Scheduled Jobs</span>
        </div>

        <div className="caat-card">
          <h2>6</h2>
          <span>Active</span>
        </div>

        <div className="caat-card">
          <h2>2</h2>
          <span>Paused</span>
        </div>

      </div>

      <div className="caat-section">

        <h2>Weekly Schedule</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={jobs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="jobs"
              fill="#1D4ED8"
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

      <div className="caat-section">

        <h2>Configured Jobs</h2>

        <table>

          <thead>

            <tr>
              <th>Job</th>
              <th>Frequency</th>
              <th>Next Run</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            {schedule.map((job) => (

              <tr key={job.name}>

                <td>{job.name}</td>

                <td>{job.frequency}</td>

                <td>{job.next}</td>

                <td>{job.status}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}