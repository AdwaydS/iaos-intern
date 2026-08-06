import { useState } from "react";

const scripts = [
  {
    name: "Duplicate Vendor Detection",
    category: "Master Data",
    status: "Ready",
    description: "Find duplicate vendor records.",
  },
  {
    name: "Benford Analysis",
    category: "Fraud",
    status: "Ready",
    description: "Detect abnormal digit distribution.",
  },
  {
    name: "Invoice Gap Check",
    category: "Procurement",
    status: "Ready",
    description: "Identify missing invoice numbers.",
  },
  {
    name: "Payroll Validation",
    category: "HR",
    status: "Ready",
    description: "Validate payroll against master data.",
  },
  {
    name: "Journal Entry Testing",
    category: "Finance",
    status: "Ready",
    description: "Find unusual journal entries.",
  },
];

export default function ScriptLibrary() {
  const [search, setSearch] = useState("");

  const filtered = scripts.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      <h2>CAAT Script Library</h2>

      <p
        style={{
          color: "var(--slate)",
          marginBottom: 20,
        }}
      >
        Execute pre-built Computer Assisted Audit scripts.
      </p>

      <input
        placeholder="Search script..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          marginBottom: 25,
        }}
      />

      <div className="caat-section">

        <table>

          <thead>

            <tr>
              <th>Script</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>

          </thead>

          <tbody>

            {filtered.map((script) => (

              <tr key={script.name}>

                <td>
                  <strong>{script.name}</strong>
                  <br />
                  <small>{script.description}</small>
                </td>

                <td>{script.category}</td>

                <td>
                  <span
                    style={{
                      background: "#DCFCE7",
                      color: "#166534",
                      padding: "5px 10px",
                      borderRadius: 20,
                      fontSize: 12,
                    }}
                  >
                    {script.status}
                  </span>
                </td>

                <td>
                  <button className="primary-btn">
                    ▶ Run
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}