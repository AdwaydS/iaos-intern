import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const keywords = [
  { name: "Fraud", count: 18 },
  { name: "Cash", count: 14 },
  { name: "Bribery", count: 9 },
  { name: "Override", count: 12 },
  { name: "Conflict", count: 6 },
];

const risks = [
  { name: "High", value: 45 },
  { name: "Medium", value: 35 },
  { name: "Low", value: 20 },
];

const COLORS = ["#1D4ED8", "#10B981", "#F59E0B"];

const matches = [
  {
    document: "VendorContract.pdf",
    keyword: "Fraud",
    frequency: 12,
    risk: "High",
  },
  {
    document: "Invoice.xlsx",
    keyword: "Cash",
    frequency: 8,
    risk: "Medium",
  },
  {
    document: "Policy.docx",
    keyword: "Bribery",
    frequency: 5,
    risk: "High",
  },
  {
    document: "Email.msg",
    keyword: "Override",
    frequency: 7,
    risk: "Low",
  },
];

export default function TextNLP() {
  return (
    <div>

      <h2>Text & NLP Mining</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Analyze documents using keyword mining and NLP techniques.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>246</h2>
          <span>Documents Scanned</span>
        </div>

        <div className="caat-card">
          <h2>124</h2>
          <span>Keyword Matches</span>
        </div>

        <div className="caat-card">
          <h2>31</h2>
          <span>High Risk Clauses</span>
        </div>

        <div className="caat-card">
          <h2>97%</h2>
          <span>Coverage</span>
        </div>

      </div>

      <div className="caat-section">

        <input
          placeholder="Search keyword..."
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
          }}
        />

      </div>

      <div className="chart-grid">

        <div className="chart-card">

          <h3>Keyword Frequency</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywords}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name"/>
              <YAxis/>
              <Tooltip/>
              <Bar dataKey="count" fill="#1D4ED8"/>
            </BarChart>
          </ResponsiveContainer>

        </div>

        <div className="chart-card">

          <h3>Risk Distribution</h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={risks}
                dataKey="value"
                outerRadius={90}
              >
                {risks.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip/>

            </PieChart>
          </ResponsiveContainer>

        </div>

      </div>

      <div className="caat-section">

        <h3>Keyword Matches</h3>

        <table>

          <thead>
            <tr>
              <th>Document</th>
              <th>Keyword</th>
              <th>Frequency</th>
              <th>Risk</th>
            </tr>
          </thead>

          <tbody>

            {matches.map((m) => (
              <tr key={m.document}>
                <td>{m.document}</td>
                <td>{m.keyword}</td>
                <td>{m.frequency}</td>
                <td>{m.risk}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

      <div className="caat-section">

        <h3>AI Findings</h3>

        <div className="caat-grid">

          <div className="caat-card">
            <h4>⚠ High Risk Clause</h4>
            <p>Vendor contract contains suspicious payment wording.</p>
          </div>

          <div className="caat-card">
            <h4>⚠ Conflict Detected</h4>
            <p>Employee references vendor relationship.</p>
          </div>

          <div className="caat-card">
            <h4>⚠ Cash References</h4>
            <p>Repeated cash payment narrations found.</p>
          </div>

        </div>

      </div>

    </div>
  );
}