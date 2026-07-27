import React, { useEffect, useState } from "react";
import { get, put, del } from "../../../lib/api";

interface Props {
  subpage: string;
  title: string;
  description: string;
}

interface DashboardStats {
  risk_index: number;
  coverage_pct: number;
  open_exceptions: number;
  pending_capa: number;
}

interface ExceptionItem {
  id: number;
  sub_page: string;
  rule_violated: string;
  severity: string;
  status: string;
  notes: string;
}

export default function StandardAuditShellView({ subpage, title, description }: Props) {
  const [stats, setStats] = useState<DashboardStats>({ risk_index: 0, coverage_pct: 100, open_exceptions: 0, pending_capa: 0 });
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sampling Builder state
  const [populationSize, setPopulationSize] = useState(500);
  const [confidenceLevel, setConfidenceLevel] = useState("95%");
  const [marginOfError, setMarginOfError] = useState("5%");
  const [samplingMethod, setSamplingMethod] = useState("Statistical Random");
  const [sampleList, setSampleList] = useState<{ id: string; name: string; contractor: string; status: string }[]>([]);

  // Connector setup state
  const [connectorStatus, setConnectorStatus] = useState<Record<string, string>>({
    sap_payroll: "Connected",
    biometric_attendance: "Connected",
    gov_pf_portal: "Disconnected",
    gov_esic_portal: "Disconnected"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const summary = await get<DashboardStats>("/api/v1/labour-compliance/dashboard-summary");
      setStats(summary);
      
      const exData = await get<ExceptionItem[]>("/api/v1/labour-compliance/exceptions");
      setExceptions(exData);
    } catch (err) {
      console.error("Failed to fetch dashboard/exception data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subpage]);

  const updateExceptionStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === "Open" ? "Under Review" : currentStatus === "Under Review" ? "Resolved" : "Open";
    try {
      await put(`/api/v1/labour-compliance/exceptions/${id}`, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status: " + err);
    }
  };

  const deleteException = async (id: number) => {
    if (!confirm("Remove this exception from queue?")) return;
    try {
      await del(`/api/v1/labour-compliance/exceptions/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete exception: " + err);
    }
  };

  const handleGenerateSamples = () => {
    const methods = ["Statistical Random", "Systematic Interval", "Judgmental Key-Item"];
    const contractors = ["ProShield Security Services", "A1 Facility Management", "QuickLogistics Warehousing"];
    const names = [
      "Amit Kumar", "Rajesh Patel", "Sanjay Sharma", "Priya Nair", "Sunita Rao",
      "Vijay Singh", "Anil Mehta", "Rohan Das", "Jyoti Gupta", "Deepak Verma"
    ];
    
    // Generate 5 mock sample entries
    const samples = Array.from({ length: 5 }, (_, i) => ({
      id: `EMP-2026-${1000 + i}`,
      name: names[Math.floor(Math.random() * names.length)],
      contractor: contractors[Math.floor(Math.random() * contractors.length)],
      status: Math.random() > 0.85 ? "Non-compliant" : "Compliant"
    }));
    setSampleList(samples);
  };

  const renderDashboard = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600, textTransform: "uppercase" }}>Live Risk Score</span>
          <h2 style={{ fontSize: 32, color: stats.risk_index > 50 ? "var(--danger)" : stats.risk_index > 20 ? "var(--gold-strong)" : "var(--success)", margin: "8px 0" }}>
            {stats.risk_index.toFixed(0)}%
          </h2>
          <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>
            {stats.risk_index > 50 ? "⚠️ Critical Risk Level" : stats.risk_index > 20 ? "⚡ Medium Risk Level" : "✓ Low Risk Level"}
          </span>
        </div>
        
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600, textTransform: "uppercase" }}>Law Coverage %</span>
          <h2 style={{ fontSize: 32, color: "var(--navy)", margin: "8px 0" }}>{stats.coverage_pct.toFixed(0)}%</h2>
          <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Applicable sites verified</span>
        </div>

        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600, textTransform: "uppercase" }}>Open Exceptions</span>
          <h2 style={{ fontSize: 32, color: stats.open_exceptions > 0 ? "var(--danger)" : "var(--navy)", margin: "8px 0" }}>
            {stats.open_exceptions}
          </h2>
          <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Red-flags needing triage</span>
        </div>

        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: "var(--slate)", fontWeight: 600, textTransform: "uppercase" }}>CAPA Actions</span>
          <h2 style={{ fontSize: 32, color: stats.pending_capa > 0 ? "var(--gold-strong)" : "var(--success)", margin: "8px 0" }}>
            {stats.pending_capa}
          </h2>
          <span style={{ fontSize: 11, color: "var(--slate-soft)" }}>Remediations in progress</span>
        </div>
      </div>

      {/* Audit Trend */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 16 }}>Labour Law Compliance Trend Log</h3>
        <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 30, justifyContent: "space-around", padding: "10px 0" }}>
          {[
            { m: "Jan", r: 12 }, { m: "Feb", r: 18 }, { m: "Mar", r: 15 },
            { m: "Apr", r: 35 }, { m: "May", r: 24 }, { m: "Jun", r: stats.risk_index }
          ].map((bar, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                height: `${Math.max(bar.r * 1.5, 6)}px`,
                width: "100%",
                maxWidth: 40,
                background: bar.r > 30 ? "var(--danger)" : "var(--navy)",
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s ease"
              }} title={`Risk Score: ${bar.r}%`} />
              <span style={{ fontSize: 12, color: "var(--slate)", marginTop: 8 }}>{bar.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScopeUniverse = () => (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 14 }}>Auditable Entities & Scope Boundary</h3>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Entity Unit</th>
            <th>Type</th>
            <th>Applicable Laws</th>
            <th>Last Scanned</th>
            <th>Audit Scope Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600 }}>Site A - Plant Manufacturing</td>
            <td>Factory Location</td>
            <td>Factories Act, CLRA, Minimum Wages, PF/ESI</td>
            <td>2026-07-01</td>
            <td><span className="badge badge-success">In Scope</span></td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Corporate HQ - Bangalore</td>
            <td>Shop & Establishment</td>
            <td>S&E Act, Maternity Benefit, POSH, PF/ESI</td>
            <td>2026-07-10</td>
            <td><span className="badge badge-success">In Scope</span></td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Site B - Warehouse Operations</td>
            <td>Commercial Depot</td>
            <td>S&E Act, CLRA, Minimum Wages, PF/ESI</td>
            <td>2026-06-15</td>
            <td><span className="badge badge-success">In Scope</span></td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600 }}>Site C - Regional Office</td>
            <td>Office Space</td>
            <td>S&E Act, POSH</td>
            <td>2026-05-12</td>
            <td><span className="badge badge-slate">Out of Scope</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderRCM = () => (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 14 }}>Risk & Control Matrix (RCM) — Labour Compliance</h3>
      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Risk Description</th>
            <th>Control Activity</th>
            <th>Assertion</th>
            <th>Control Owner</th>
            <th>Test Frequency</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: 600, color: "var(--danger)" }}>Statutory wage rates are not met, leading to fines & site closure.</td>
            <td>Daily contractor wage reconciliations against state gazette publications.</td>
            <td>Accuracy, Completeness</td>
            <td>HR Operations Lead</td>
            <td>Monthly</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: "var(--danger)" }}>Unlicenced deployment of contract labourers violating CLRA guidelines.</td>
            <td>Mandatory upload and verification of contractor registration before job allocations.</td>
            <td>Valuation, Compliance</td>
            <td>Procurement Head</td>
            <td>Quarterly</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 600, color: "var(--danger)" }}>Non-deposit of PF/ESI deductions causing fiduciary legal action.</td>
            <td>Automated mismatch validation checks between challan totals and payroll registers.</td>
            <td>Existence, Valuation</td>
            <td>Corporate Comptroller</td>
            <td>Monthly</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderExceptionQueue = () => (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ color: "var(--navy)", fontSize: 16 }}>Exceptions & Red-Flag Audit Queue</h3>
          <p style={{ fontSize: 12.5, color: "var(--slate)" }}>Triage and investigate automated anomalies raised during reviews.</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchData} style={{ fontSize: 13, padding: "8px 12px" }}>
          🔄 Refresh Queue
        </button>
      </div>

      <table style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Subpage Domain</th>
            <th>Rule Violated</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Incident Details / Notes</th>
            <th style={{ width: 140, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exceptions.map((ex) => (
            <tr key={ex.id}>
              <td style={{ fontWeight: 600, color: "var(--navy)" }}>{ex.sub_page}</td>
              <td style={{ color: "var(--danger)" }}>{ex.rule_violated}</td>
              <td>
                <span className={`badge ${ex.severity === "High" ? "badge-danger" : ex.severity === "Medium" ? "badge-gold" : "badge-slate"}`}>
                  {ex.severity}
                </span>
              </td>
              <td>
                <span className={`badge ${ex.status === "Resolved" ? "badge-success" : ex.status === "Under Review" ? "badge-gold" : "badge-danger"}`}>
                  {ex.status}
                </span>
              </td>
              <td style={{ fontSize: 12.5, color: "var(--slate)" }}>{ex.notes || "—"}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "5px 10px", fontSize: 12, marginRight: 6 }}
                  onClick={() => updateExceptionStatus(ex.id, ex.status)}
                >
                  {ex.status === "Open" ? "Investigate" : ex.status === "Under Review" ? "Resolve" : "Re-open"}
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "5px 8px", color: "var(--danger)" }}
                  onClick={() => deleteException(ex.id)}
                  title="Remove"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {exceptions.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--slate)" }}>
                No active anomalies in the exception queue. Great job!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSamplingBuilder = () => (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.25fr" }}>
      <div className="card" style={{ padding: 24, height: "fit-content" }}>
        <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 16 }}>Audit Sampling Builder</h3>
        
        <div className="field">
          <label>Total Population Size (Headcount)</label>
          <input
            type="number"
            className="input"
            value={populationSize}
            onChange={(e) => setPopulationSize(parseInt(e.target.value) || 0)}
          />
        </div>

        <div className="field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Confidence Level</label>
            <select className="select" value={confidenceLevel} onChange={(e) => setConfidenceLevel(e.target.value)}>
              <option value="90%">90%</option>
              <option value="95%">95%</option>
              <option value="99%">99%</option>
            </select>
          </div>
          <div>
            <label>Margin of Error</label>
            <select className="select" value={marginOfError} onChange={(e) => setMarginOfError(e.target.value)}>
              <option value="10%">10%</option>
              <option value="5%">5%</option>
              <option value="2%">2%</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Sampling Methodology</label>
          <select className="select" value={samplingMethod} onChange={(e) => setSamplingMethod(e.target.value)}>
            <option value="Statistical Random">Statistical Random Selection</option>
            <option value="Systematic Interval">Systematic Interval Selection</option>
            <option value="Judgmental Key-Item">Judgmental / Risk-Based Sample</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block" onClick={handleGenerateSamples}>
          Generate Audit Sample
        </button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 14 }}>Sample Output List</h3>
        <table style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Contractor / Supplier</th>
              <th>Compliance Check</th>
            </tr>
          </thead>
          <tbody>
            {sampleList.map((samp) => (
              <tr key={samp.id}>
                <td style={{ fontWeight: 600 }}>{samp.id}</td>
                <td>{samp.name}</td>
                <td>{samp.contractor}</td>
                <td>
                  <span className={`badge ${samp.status === "Compliant" ? "badge-success" : "badge-danger"}`}>
                    {samp.status}
                  </span>
                </td>
              </tr>
            ))}
            {sampleList.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--slate)" }}>
                  Click "Generate Audit Sample" to run statistical selection queries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDataSources = () => (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ color: "var(--navy)", fontSize: 16, marginBottom: 14 }}>Data Source & System Connector Setup</h3>
      <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 18 }}>
        Map API integrations and system connectors that pull live headcount, biometric rosters, and government remittance records.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {Object.entries(connectorStatus).map(([connector, stat]) => (
          <div key={connector} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            background: stat === "Connected" ? "var(--success-tint)" : "var(--canvas)"
          }}>
            <div>
              <strong style={{ display: "block", color: "var(--navy)", textTransform: "capitalize" }}>
                {connector.replace(/_/g, " ")}
              </strong>
              <span style={{ fontSize: 11.5, color: "var(--slate-soft)" }}>
                {connector === "sap_payroll" ? "SAP ECC HR/Payroll Ledger" : 
                 connector === "biometric_attendance" ? "Honeywell Access Gates" : 
                 connector === "gov_pf_portal" ? "EPFO Unified Portal API" : "ESIC Employer Portal"}
              </span>
            </div>
            <button 
              className={`badge ${stat === "Connected" ? "badge-success" : "badge-slate"}`}
              style={{ cursor: "pointer", border: "none" }}
              onClick={() => setConnectorStatus(c => ({ ...c, [connector]: stat === "Connected" ? "Disconnected" : "Connected" }))}
            >
              {stat}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGenericPlaceholder = () => (
    <div className="card" style={{ padding: 36, textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>📋</span>
      <h3 style={{ color: "var(--navy)", fontSize: 18, marginTop: 14, marginBottom: 6 }}>{title} Workspace</h3>
      <p style={{ fontSize: 13.5, color: "var(--slate)", maxWidth: 500, margin: "0 auto 16px auto" }}>
        {description}. Injected audit context: <strong>Module 36 (Labour Law & Compliance)</strong>.
      </p>
      <button className="btn btn-ghost" style={{ padding: "8px 16px" }} onClick={() => alert("Simulated action triggered!")}>
        Initialize {title} Instance
      </button>
    </div>
  );

  // Switch based on subpage
  switch (subpage) {
    case "module_dashboard":
      return renderDashboard();
    case "scope_universe":
      return renderScopeUniverse();
    case "risk_control_matrix":
      return renderRCM();
    case "exception_queue":
      return renderExceptionQueue();
    case "sampling_builder":
      return renderSamplingBuilder();
    case "data_sources":
      return renderDataSources();
    default:
      return renderGenericPlaceholder();
  }
}
