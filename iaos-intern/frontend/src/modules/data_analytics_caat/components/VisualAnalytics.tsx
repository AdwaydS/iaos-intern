import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const sales = [
  { month: "Jan", value: 18 },
  { month: "Feb", value: 24 },
  { month: "Mar", value: 21 },
  { month: "Apr", value: 28 },
  { month: "May", value: 31 },
  { month: "Jun", value: 36 },
];

const expenses = [
  { name: "HR", value: 22 },
  { name: "IT", value: 30 },
  { name: "Finance", value: 18 },
  { name: "Operations", value: 30 },
];

const COLORS = [
  "#1D4ED8",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

export default function VisualAnalytics() {
  return (
    <div>

      <h2>Visual Analytics Studio</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Build dashboards and explore audit data visually.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>12</h2>
          <span>Dashboards</span>
        </div>

        <div className="caat-card">
          <h2>48</h2>
          <span>Charts</span>
        </div>

        <div className="caat-card">
          <h2>19</h2>
          <span>Saved Views</span>
        </div>

        <div className="caat-card">
          <h2>7</h2>
          <span>Shared Reports</span>
        </div>

      </div>

      <div className="caat-section">

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <button>Revenue</button>
          <button>Expenses</button>
          <button>Vendors</button>
          <button>Payroll</button>
          <button>Export Dashboard</button>
        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Monthly Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sales}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>
              <Line
                dataKey="value"
                stroke="#1D4ED8"
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Department Spend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenses}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar
                dataKey="value"
                fill="#10B981"
              />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Expense Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>

            <PieChart>

              <Pie
                data={expenses}
                dataKey="value"
                outerRadius={90}
              >

                {expenses.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i]}
                  />
                ))}

              </Pie>

            </PieChart>

          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Insights</h3>

          <ul
            style={{
              lineHeight: 2,
            }}
          >
            <li>Revenue increased by 18%</li>
            <li>Payroll stable for 6 months</li>
            <li>Vendor spend increased 9%</li>
            <li>Finance costs below budget</li>
            <li>IT spend requires review</li>
          </ul>

        </div>

      </div>

    </div>
  );
}