import {
  Database,
  Server,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Link,
} from "lucide-react";

export default function DataSources() {

  const sources = [
    {
      source_name: "SAP ERP",
      source_type: "SAP HANA",
      status: "Connected",
      mapped_tables: 86,
      last_sync: "5 mins ago",
    },
    {
      source_name: "Oracle Finance",
      source_type: "Oracle",
      status: "Connected",
      mapped_tables: 54,
      last_sync: "10 mins ago",
    },
    {
      source_name: "SQL Server",
      source_type: "Database",
      status: "Connected",
      mapped_tables: 34,
      last_sync: "2 mins ago",
    },
    {
      source_name: "CSV Upload",
      source_type: "Flat File",
      status: "Pending",
      mapped_tables: 8,
      last_sync: "Today",
    },
  ];

  return (
    <div>

      <h2 style={{ fontSize: 30, fontWeight: 700 }}>
        Data Source & Connector Setup
      </h2>

      <p
        style={{
          color: "var(--slate)",
          marginTop: 8,
          marginBottom: 25,
        }}
      >
        Configure ERP systems, databases, APIs and uploaded files that feed the
        analytics engine.
      </p>

      <div className="grid grid-cols-4 gap-4">

        <div className="metric-card">
          <Database size={34}/>
          <h1>18</h1>
          <span>Connected Sources</span>
        </div>

        <div className="metric-card">
          <Server size={34}/>
          <h1>412</h1>
          <span>Mapped Tables</span>
        </div>

        <div className="metric-card">
          <Cloud size={34}/>
          <h1>24</h1>
          <span>API Connectors</span>
        </div>

        <div className="metric-card">
          <Link size={34}/>
          <h1>98%</h1>
          <span>Connection Health</span>
        </div>

      </div>

      <br/>

      <div className="card">

        <h3>Configured Data Sources</h3>

        <table className="table">

          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Status</th>
              <th>Mapped Tables</th>
              <th>Last Sync</th>
            </tr>
          </thead>

          <tbody>

            {sources.map((item) => (

              <tr key={item.source_name}>

                <td>{item.source_name}</td>

                <td>{item.source_type}</td>

                <td>
                  {item.status === "Connected" ? (
                    <span style={{ color: "green" }}>
                      <CheckCircle size={16}/> Connected
                    </span>
                  ) : (
                    <span style={{ color: "orange" }}>
                      <AlertTriangle size={16}/> Pending
                    </span>
                  )}
                </td>

                <td>{item.mapped_tables}</td>

                <td>{item.last_sync}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <br/>

      <div className="grid grid-cols-2 gap-4">

        <div className="card">

          <h3>ERP Table Mapping</h3>

          <ul>
            <li>BKPF → Journal Entries</li>
            <li>BSEG → Line Items</li>
            <li>LFA1 → Vendors</li>
            <li>KNA1 → Customers</li>
            <li>EKPO → Purchase Orders</li>
            <li>RBKP → Vendor Invoices</li>
          </ul>

        </div>

        <div className="card">

          <h3>Connector Status</h3>

          <table className="table">

            <tbody>

              <tr><td>SAP</td><td>Healthy</td></tr>
              <tr><td>Oracle</td><td>Healthy</td></tr>
              <tr><td>REST APIs</td><td>Healthy</td></tr>
              <tr><td>CSV Upload</td><td>Waiting</td></tr>
              <tr><td>Excel Upload</td><td>Healthy</td></tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}