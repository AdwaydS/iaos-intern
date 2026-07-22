import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const files = [
  {
    name: "Payroll.xlsx",
    type: "Excel",
    size: "3.4 MB",
    uploaded: "Today",
  },
  {
    name: "Vendor.csv",
    type: "CSV",
    size: "2.1 MB",
    uploaded: "Yesterday",
  },
  {
    name: "Invoices.xlsx",
    type: "Excel",
    size: "5.8 MB",
    uploaded: "12 Jul",
  },
];

const data = [
  { name: "Excel", value: 70 },
  { name: "CSV", value: 30 },
];

const colors = ["#1D4ED8", "#10B981"];

export default function Evidence() {
  return (
    <div>

      <h2>Audit Evidence Repository</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 25,
        }}
      >
        Manage imported audit evidence and supporting files.
      </p>

      <div className="caat-grid">

        <div className="caat-card">
          <h2>43</h2>
          <span>Evidence Files</span>
        </div>

        <div className="caat-card">
          <h2>11.3 GB</h2>
          <span>Total Storage</span>
        </div>

        <div className="caat-card">
          <h2>3</h2>
          <span>Recent Uploads</span>
        </div>

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginTop: 20,
        }}
      >

        <div className="caat-section">

          <h2>Evidence Files</h2>

          <table>

            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
              </tr>
            </thead>

            <tbody>

              {files.map((f) => (

                <tr key={f.name}>
                  <td>{f.name}</td>
                  <td>{f.type}</td>
                  <td>{f.size}</td>
                  <td>{f.uploaded}</td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="caat-section">

          <h2>File Types</h2>

          <ResponsiveContainer width="100%" height={250}>

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                outerRadius={80}
                label
              >

                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={colors[i]}
                  />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}