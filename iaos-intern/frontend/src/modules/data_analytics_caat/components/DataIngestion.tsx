export default function DataIngestion() {
  return (
    <div style={{ display: "grid", gap: 24 }}>

      <div className="card" style={{ padding: 24 }}>

        <h2>Upload Dataset</h2>

        <p
          style={{
            color: "var(--slate)",
            marginTop: 8,
            marginBottom: 20,
          }}
        >
          Import Excel or CSV files for CAAT analysis.
        </p>

        <div
          style={{
            border: "2px dashed #CBD5E1",
            borderRadius: 12,
            padding: 50,
            textAlign: "center",
          }}
        >
          <h3>Drag & Drop Files Here</h3>

          <p
            style={{
              color: "var(--slate)",
              margin: "15px 0",
            }}
          >
            Supported formats
          </p>

          <p>.xlsx &nbsp;&nbsp; .xls &nbsp;&nbsp; .csv</p>

          <br />

          <button className="btn btn-primary">
            Browse Files
          </button>
        </div>

      </div>

      <div className="card" style={{ padding: 24 }}>

        <h2>Imported Datasets</h2>

        <table>

          <thead>

            <tr>
              <th>Dataset</th>
              <th>Rows</th>
              <th>Uploaded By</th>
              <th>Date</th>
              <th>Status</th>
            </tr>

          </thead>

          <tbody>

            <tr>

              <td>Payroll.xlsx</td>

              <td>4210</td>

              <td>HS</td>

              <td>Today</td>

              <td>
                <span className="badge badge-success">
                  Ready
                </span>
              </td>

            </tr>

            <tr>

              <td>Vendor.csv</td>

              <td>8441</td>

              <td>HS</td>

              <td>Today</td>

              <td>
                <span className="badge badge-success">
                  Ready
                </span>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}