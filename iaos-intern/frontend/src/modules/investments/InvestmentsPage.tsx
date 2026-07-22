import React, { useState, useEffect, useRef } from "react";
import {
  Building,
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Layers,
  Search,
  Database,
  Scale,
  Plus,
  ArrowRight,
  User,
  Settings,
  Info,
  Check,
  X,
  FileCheck,
  TrendingUp,
  FileSpreadsheet,
  Clock,
  Briefcase,
  Sliders,
  Terminal,
} from "lucide-react";
import { get, post } from "../../lib/api";
import "./InvestmentsPage.css";


// Types matching backend
interface InvestmentsException {
  id: string;
  module: string;
  security: string;
  amount: string;
  exception: string;
  date: string;
  severity: string;
  status: string;
}

interface SectorGuardrail {
  id: number;
  sector: string;
  limit_pct: number;
  current_pct: number;
  status: string;
}

interface ComplianceTrendPoint {
  id: number;
  month: string;
  score: number;
  exceptions_count: number;
}

export default function InvestmentsAuditPage() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>("dashboard_kpis");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Data States
  const [exceptions, setExceptions] = useState<InvestmentsException[]>([]);
  const [guardrails, setGuardrails] = useState<SectorGuardrail[]>([]);
  const [trends, setTrends] = useState<ComplianceTrendPoint[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Simulation Form States
  const [simProcedure, setSimProcedure] = useState<string>("holdings_reconciliation");
  const [simSampleSize, setSimSampleSize] = useState<number>(10);
  const [simTolerance, setSimTolerance] = useState<number>(0.10);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simRunning, setSimRunning] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [excData, guardData, trendData] = await Promise.all([
        get<InvestmentsException[]>("/api/modules/investments_audit/exceptions"),
        get<SectorGuardrail[]>("/api/modules/investments_audit/sector-guardrails"),
        get<ComplianceTrendPoint[]>("/api/modules/investments_audit/compliance-trends"),
      ]);
      setExceptions(excData);
      setGuardrails(guardData);
      setTrends(trendData);
      setError("");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to load Investments Audit data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to bottom of terminal when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [simLogs]);

  // Handle resolving an exception
  const handleResolve = async (id: string) => {
    try {
      const updated = await post<InvestmentsException[]>("/api/modules/investments_audit/exceptions/resolve", { id });
      setExceptions(updated);
    } catch (e: any) {
      alert("Failed to resolve exception: " + e.message);
    }
  };

  // Run Real-Time Stream Simulation
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimRunning(true);
    setSimLogs(["[SYSTEM] Connection established with simulation agent..."]);
    setSimResult(null);

    const activeProcedureLabel = ALL_SUBPAGES.find(p => p.id === simProcedure)?.title || simProcedure;

    try {
      const response = await fetch("/api/modules/investments_audit/procedures/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("iaos_token") || ""}`
        },
        body: JSON.stringify({
          procedure_id: activeProcedureLabel,
          sample_size: Number(simSampleSize),
          tolerance: Number(simTolerance)
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Response body is not readable");

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (!dataStr) continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.type === "log") {
                setSimLogs(prev => [...prev, data.message]);
              } else if (data.type === "summary") {
                setSimResult(data);
              }
            } catch (err) {
              // Plain text fallback
              setSimLogs(prev => [...prev, dataStr]);
            }
          }
        }
      }

      // Re-fetch exceptions to update tables and charts
      await fetchData();
    } catch (err: any) {
      setSimLogs(prev => [...prev, `[ERROR] Simulation failed: ${err.message}`]);
    } finally {
      setSimRunning(false);
    }
  };

  // Define All 25 Subpages
  const SIGNATURE_PAGES = [
    { id: "holdings_reconciliation", title: "Holdings vs Custodian Reconciliation", desc: "Reconcile ERP ledger values to physical Demat / Custodian statements.", icon: RefreshCw },
    { id: "valuation_testing", title: "Valuation & Fair-Value Testing", desc: "Audit mark-to-market calculations, pricing feeds, and impairment indicators.", icon: Scale },
    { id: "board_approval_limits", title: "Board Approval vs Limits", desc: "Verify transactions comply with delegated authorization matrices and limits.", icon: FileCheck },
    { id: "income_recomputation", title: "Income Recomputation", desc: "Recompute expected interest coupon and dividend rates against actual bank inflows.", icon: Sliders },
    { id: "related_party_flag", title: "Related-Party Investment Flag", desc: "Scan and flag undisclosed or unauthorized investments in group/related companies.", icon: Shield },
    { id: "concentration_exposure", title: "Concentration & Exposure", desc: "Analyze exposure boundaries by asset class, single issuer, and industry sector.", icon: Layers },
    { id: "maturity_rollover", title: "Maturity & Rollover Tracking", desc: "Review reinvestment, cash settlement, and rollover authorization controls.", icon: Clock },
    { id: "instrument_master_governance", title: "Instrument Master Governance", desc: "Audit static security parameters, ISIN registry, and rating thresholds.", icon: Database },
    { id: "realised_gain_loss", title: "Realised Gain/Loss Testing", desc: "Re-calculate FIFO / weighted-average calculations on sold holdings.", icon: TrendingUp },
    { id: "mandate_policy", title: "Mandate & Policy Compliance", desc: "Test holdings against compliance boundaries defined in the Investment Policy Statement.", icon: FileText },
    { id: "accrued_income_ageing", title: "Accrued Income Ageing", desc: "Track and age overdue coupon collections and dividend distributions.", icon: Clock },
    { id: "impairment_screening", title: "Impairment Trigger Screening", desc: "Assess ECL, credit deterioration cues, and diminution in value thresholds.", icon: AlertTriangle },
    { id: "pledged_lien", title: "Pledged / Lien Investments", desc: "Verify encumbered securities, lien assignments, and margin pledges.", icon: FileSpreadsheet },
    { id: "broker_dealing", title: "Broker & Dealing Controls", desc: "Monitor broker empanelment, split volumes, and commission payouts.", icon: User },
    { id: "disclosure_classification", title: "Disclosure & Classification", desc: "Verify classification rules under accounting standards (FVTPL vs FVOCI).", icon: FileText }
  ];

  const SHELL_PAGES = [
    { id: "dashboard_kpis", title: "Module Dashboard & KPIs", desc: "Executive view of investment risks, exceptions trend, and test coverage.", icon: TrendingUp },
    { id: "scope_universe", title: "Scope & Audit Universe", desc: "Define entity scopes, treasury units, and bank accounts in scope.", icon: Building },
    { id: "rcm_matrix", title: "Risk & Control Matrix (RCM)", desc: "Directory of risks, controls, assertions, and control ownership tags.", icon: Shield },
    { id: "test_rule_library", title: "Test & Analytics Rule Library", desc: "Configure automated CAAT scripts, checks, and deviation thresholds.", icon: Sliders },
    { id: "data_connector_setup", title: "Data Source & Connector Setup", desc: "Map custody APIs, ERP ledger uploads, and Bloomberg endpoints.", icon: Database },
    { id: "sampling_builder", title: "Sampling & Population Builder", desc: "Draw random or monetary-unit samples from transaction data.", icon: Layers },
    { id: "exception_queue", title: "Exception & Red-Flag Queue", desc: "Triage and resolve system-generated investment anomalies.", icon: AlertTriangle },
    { id: "working_papers", title: "Working Papers & Evidence", desc: "Store evidence files, tickmark worksheets, and reviewer approvals.", icon: FileCheck },
    { id: "observation_log", title: "Observation & Finding Log", desc: "Track formal audit findings, severity scoring, and management responses.", icon: FileText },
    { id: "remediation_tracker", title: "Remediation & CAPA Tracker", desc: "Follow up on corrective actions, progress reviews, and recheck cycles.", icon: RefreshCw }
  ];

  const ALL_SUBPAGES = [...SHELL_PAGES, ...SIGNATURE_PAGES];

  // Filter subpages based on search
  const filteredSignature = SIGNATURE_PAGES.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredShell = SHELL_PAGES.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePageObj = ALL_SUBPAGES.find(p => p.id === activeTab);

  // Statistics Computations
  const totalExceptions = exceptions.length;
  const unresolvedExceptions = exceptions.filter(e => e.status !== "Resolved").length;
  const resolvedExceptions = exceptions.filter(e => e.status === "Resolved").length;
  const currentScore = trends.length > 0 ? trends[trends.length - 1].score : 90;

  // Custom SVG Chart rendering helpers
  const renderTrendLine = () => {
    if (trends.length < 2) return null;
    const width = 600;
    const height = 150;
    const padding = 25;
    
    const minVal = Math.min(...trends.map(t => t.score)) - 5;
    const maxVal = 100;
    const valRange = maxVal - minVal;

    const points = trends.map((t, index) => {
      const x = padding + (index / (trends.length - 1)) * (width - padding * 2);
      const y = height - padding - ((t.score - minVal) / valRange) * (height - padding * 2);
      return { x, y, ...t };
    });

    const d = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, "");

    return (
      <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "180px" }}>
        {/* Grids */}
        {[80, 90, 100].map(gridVal => {
          const y = height - padding - ((gridVal - minVal) / valRange) * (height - padding * 2);
          return (
            <g key={gridVal}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeDasharray="3 3" />
              <text x={padding - 5} y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{gridVal}%</text>
            </g>
          );
        })}
        {/* Area Gradient */}
        <path
          d={`${d} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#grad)"
          opacity="0.15"
        />
        {/* Line */}
        <path d={d} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        {/* Nodes */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            <text x={p.x} y={p.y - 12} fill="#ffffff" fontSize="11" fontWeight="600" textAnchor="middle">{p.score}%</text>
            <text x={p.x} y={height - 5} fill="#94a3b8" fontSize="10" textAnchor="middle">{p.month}</text>
          </g>
        ))}
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="iaos-investments-audit">
      <div className="iaos-layout-grid">
        
        {/* Sidebar sub-navigation panel */}
        <aside className="iaos-module-sidebar">
          <div className="sidebar-search">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search 25 subpages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <X className="clear-search" size={14} onClick={() => setSearchTerm("")} />}
          </div>

          <div className="sidebar-scrollable">
            {/* 1. Main views & config shells */}
            <div className="sidebar-section">
              <span className="section-title">Dashboard & Admin Shells ({filteredShell.length})</span>
              {filteredShell.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    className={`sidebar-nav-btn ${activeTab === p.id ? "active" : ""}`}
                    onClick={() => setActiveTab(p.id)}
                  >
                    <IconComponent size={16} className="nav-icon" />
                    <span className="nav-label">{p.title}</span>
                    {p.id === "exception_queue" && unresolvedExceptions > 0 && (
                      <span className="nav-badge alert">{unresolvedExceptions}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 2. 15 Signature Audit Procedures */}
            <div className="sidebar-section">
              <span className="section-title">Signature Audit Procedures ({filteredSignature.length})</span>
              {filteredSignature.map((p) => {
                const IconComponent = p.icon;
                return (
                  <button
                    key={p.id}
                    className={`sidebar-nav-btn ${activeTab === p.id ? "active" : ""}`}
                    onClick={() => setActiveTab(p.id)}
                  >
                    <IconComponent size={16} className="nav-icon" />
                    <span className="nav-label">{p.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Content Viewer Panel */}
        <main className="iaos-module-content">
          {error && <div className="error-alert"><AlertTriangle size={18} /> {error}</div>}
          
          {loading && !simRunning ? (
            <div className="loading-state">
              <RefreshCw size={36} className="spinner" />
              <span>Fetching secure tenant records...</span>
            </div>
          ) : (
            <div className="view-content-wrapper">
              
              {/* Header inside viewer */}
              <div className="view-header">
                <div className="view-header-title">
                  <h2>{activePageObj?.title}</h2>
                  <p>{activePageObj?.desc}</p>
                </div>
                <div className="view-header-badge">
                  <span className={`status-pill ${activePageObj?.id.includes("dashboard") || activePageObj?.id.includes("reconciliation") ? "active" : "verified"}`}>
                    {activeTab in SIGNATURE_PAGES.map(p => p.id) || SIGNATURE_PAGES.some(p => p.id === activeTab) ? "Signature Testing Enabled" : "Shell Layout"}
                  </span>
                </div>
              </div>

              {/* VIEW SWITCHER */}

              {/* 1. Module Dashboard & KPIs */}
              {activeTab === "dashboard_kpis" && (
                <div className="subpage-dashboard">
                  <div className="stat-cards-grid">
                    <div className="kpi-card">
                      <span className="kpi-label">Active Exceptions</span>
                      <span className="kpi-value text-red">{unresolvedExceptions}</span>
                      <span className="kpi-subtext">Requires auditor verification</span>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Compliance Score</span>
                      <span className="kpi-value text-blue">{currentScore}%</span>
                      <span className="kpi-subtext">Overall portfolio trust index</span>
                    </div>
                    <div className="kpi-card">
                      <span className="kpi-label">Sector Rules Tracked</span>
                      <span className="kpi-value text-green">{guardrails.length}</span>
                      <span className="kpi-subtext">Real-time concentration boundaries</span>
                    </div>
                  </div>

                  <div className="dashboard-row">
                    <div className="dashboard-col card border-glow">
                      <h3>Audit Compliance Score Trend</h3>
                      <div className="chart-container">
                        {renderTrendLine()}
                      </div>
                    </div>

                    <div className="dashboard-col card">
                      <h3>Active Sector Concentration Caps</h3>
                      <div className="sector-limits-list">
                        {guardrails.map((g) => (
                          <div key={g.id} className="sector-limit-row">
                            <div className="sector-meta">
                              <span className="sector-name">{g.sector}</span>
                              <span className="sector-values">{g.current_pct}% / {g.limit_pct}% Cap</span>
                            </div>
                            <div className="sector-progress-bar">
                              <div
                                className={`progress-fill ${g.status === "Breached" ? "danger" : "normal"}`}
                                style={{ width: `${Math.min(100, (g.current_pct / g.limit_pct) * 100)}%` }}
                              ></div>
                            </div>
                            <div className="sector-status">
                              <span className={`badge ${g.status === "Breached" ? "badge-danger" : "badge-success"}`}>
                                {g.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Simulator Quick Launch card */}
                  <div className="card start-simulation-banner">
                    <div className="banner-text">
                      <h4>Launch Simulated Controls Verification Procedure</h4>
                      <p>Draw a statistical sample population of investments and perform real-time verification testing on custodial records.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setActiveTab("sampling_builder")}>
                      Open Simulation Panel <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Holdings vs Custodian Reconciliation (Signature) */}
              {activeTab === "holdings_reconciliation" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Reconciliation Registry (ERP Book vs Custody Statement)</h3>
                    <p className="section-instruction">Compare securities quantity and values declared in internal ledgers with external securities statements (Demat/NSDL/CDSL/BNY Mellon).</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Name</th>
                            <th>ERP Qty</th>
                            <th>Custodian Qty</th>
                            <th>Difference</th>
                            <th>ERP Value</th>
                            <th>Custodian Value</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Microsoft Corp Note 2029</strong></td>
                            <td>15,000</td>
                            <td>15,000</td>
                            <td className="text-green">0</td>
                            <td>$15,000,000</td>
                            <td>$15,000,000</td>
                            <td><span className="badge badge-success">Match</span></td>
                          </tr>
                          <tr>
                            <td><strong>Tesla Inc Note 2028</strong></td>
                            <td>12,500</td>
                            <td>12,500</td>
                            <td className="text-green">0</td>
                            <td>$12,500,000</td>
                            <td>$12,500,000</td>
                            <td><span className="badge badge-success">Match</span></td>
                          </tr>
                          <tr>
                            <td><strong>Evergreen Real Estate Trust</strong></td>
                            <td>4,200</td>
                            <td>4,000</td>
                            <td className="text-red">+200</td>
                            <td>$4,200,000</td>
                            <td>$4,000,000</td>
                            <td><span className="badge badge-danger">Unreconciled</span></td>
                          </tr>
                          <tr>
                            <td><strong>Vertex Pharma Paper</strong></td>
                            <td>8,000</td>
                            <td>8,000</td>
                            <td className="text-green">0</td>
                            <td>$8,000,000</td>
                            <td>$8,000,000</td>
                            <td><span className="badge badge-success">Match</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="reconciliation-actions">
                      <button className="btn btn-secondary" onClick={() => alert("Re-running automated ledger balance sync...")}>
                        Refresh Ledger Synced Balances
                      </button>
                      <button className="btn btn-primary" onClick={() => { setActiveTab("sampling_builder"); setSimProcedure("holdings_reconciliation"); }}>
                        Run Sample Audit Simulation
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Valuation & Fair-Value Testing (Signature) */}
              {activeTab === "valuation_testing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Fair-Value Discrepancy Testing Panel</h3>
                    <p className="section-instruction">Verify internal book pricing against independent market pricing sources (Bloomberg, Refinitiv, or Broker Quotes) and calculate Impairment Provisions.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Holding</th>
                            <th>Cost price</th>
                            <th>Independent Price</th>
                            <th>ERP Book Price</th>
                            <th>Variance %</th>
                            <th>ECL Impairment Triggered</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Goldman Sachs MT Note</td>
                            <td>$100.00</td>
                            <td>$100.25</td>
                            <td>$100.00</td>
                            <td>-0.25%</td>
                            <td>No</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                          <tr>
                            <td>Vertex Pharma Paper</td>
                            <td>$100.00</td>
                            <td>$97.50</td>
                            <td>$100.00</td>
                            <td className="text-red">+2.56%</td>
                            <td>Yes (Rating Downgrade BBB+)</td>
                            <td><span className="badge badge-warning">Review Needed</span></td>
                          </tr>
                          <tr>
                            <td>Amazon Paper 2027</td>
                            <td>$100.00</td>
                            <td>$99.95</td>
                            <td>$99.95</td>
                            <td>0.00%</td>
                            <td>No</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Board Approval vs Limits (Signature) */}
              {activeTab === "board_approval_limits" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Delegated Financial Authority Limits Review</h3>
                    <p className="section-instruction">Audit whether investments exceed delegation caps without specific Board of Directors or Treasury Committee approvals.</p>
                    
                    <div className="limits-grid">
                      <div className="limit-block">
                        <h5>CFO Approval Limit</h5>
                        <div className="limit-val">$2,000,000</div>
                      </div>
                      <div className="limit-block">
                        <h5>Treasury Committee Limit</h5>
                        <div className="limit-val">$5,000,000</div>
                      </div>
                      <div className="limit-block">
                        <h5>Board of Directors Limit</h5>
                        <div className="limit-val">Unlimited</div>
                      </div>
                    </div>

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Investment Amount</th>
                            <th>Authorized Signatory</th>
                            <th>Resolution Ref</th>
                            <th>Board Appr Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="breached-row">
                            <td><strong>Tesla Inc. Corporate Note</strong></td>
                            <td>$12,500,000</td>
                            <td>CFO Sign-off Only</td>
                            <td><span className="text-red">Missing Resolution</span></td>
                            <td><span className="badge badge-danger">Breach: Limit Exceeded</span></td>
                          </tr>
                          <tr>
                            <td>Vertex Pharma Commercial Paper</td>
                            <td>$8,000,000</td>
                            <td>Board Committee</td>
                            <td>RES-2026-901</td>
                            <td><span className="badge badge-success">Approved</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Income Recomputation (Signature) */}
              {activeTab === "income_recomputation" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Coupon & Dividend Income Recomputation Engine</h3>
                    <p className="section-instruction">Recalculate yield expectations (coupon rates × face value × daycount convention) and reconcile to received payments.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Holding Security</th>
                            <th>Coupon Rate</th>
                            <th>Daycount</th>
                            <th>Expected Coupon</th>
                            <th>Actual Received</th>
                            <th>Variance</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Tesla Inc. Note</td>
                            <td>4.50%</td>
                            <td>30/360</td>
                            <td>$281,250</td>
                            <td>$281,250</td>
                            <td>$0</td>
                            <td><span className="badge badge-success">Match</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Apex Global Equities</strong></td>
                            <td>4.50% (declared)</td>
                            <td>Act/365</td>
                            <td>$67,500</td>
                            <td>$36,000</td>
                            <td className="text-red">-$31,500</td>
                            <td><span className="badge badge-danger">Mismatch</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Related-Party Investment Flag (Signature) */}
              {activeTab === "related_party_flag" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Related-Party Exposures Monitor</h3>
                    <p className="section-instruction">Verify that investments in affiliate and associate firms are correctly flagged and approved under disclosures guidelines.</p>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Asset Name</th>
                            <th>Relationship</th>
                            <th>Exposure Amount</th>
                            <th>Disclosure Status</th>
                            <th>Approval Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Cap Corp Logistics Debentures</td>
                            <td>Subsidiary (100% Owned)</td>
                            <td>$3,000,000</td>
                            <td>Declared in Note 24</td>
                            <td><span className="badge badge-success">Approved</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Apex Global Equities</strong></td>
                            <td>Associate (CFO holds Board seat)</td>
                            <td>$1,500,000</td>
                            <td><span className="text-red">Not Disclosed</span></td>
                            <td><span className="badge badge-warning">No Approval Record</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Concentration & Exposure (Signature) */}
              {activeTab === "concentration_exposure" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Single-Issuer & Industry Sector Concentration Boundaries</h3>
                    <p className="section-instruction">Review concentration statistics against Investment Policy limits (Single-Issuer Limit: 10% of total holdings, Sector Limit: 20-30%).</p>
                    
                    <div className="guardrails-box">
                      {guardrails.map(g => (
                        <div key={g.id} className="limit-meter-card">
                          <div className="meter-head">
                            <strong>{g.sector}</strong>
                            <span>{g.current_pct}% / {g.limit_pct}% Max</span>
                          </div>
                          <div className="progress-track">
                            <div className={`progress-bar ${g.status === "Breached" ? "danger" : "normal"}`} style={{ width: `${(g.current_pct / g.limit_pct) * 100}%` }}></div>
                          </div>
                          <div className="meter-foot">
                            <span className={g.status === "Breached" ? "text-red" : "text-green"}>{g.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Maturity & Rollover Tracking (Signature) */}
              {activeTab === "maturity_rollover" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Upcoming Maturities & Rollover Approvals Ledger</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Name</th>
                            <th>Maturity Date</th>
                            <th>Rollover Terms</th>
                            <th>Authorized By</th>
                            <th>Action Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Chevron Corp Debenture</td>
                            <td>2026-08-15</td>
                            <td>N/A (Settle Cash)</td>
                            <td>Treasury Desk</td>
                            <td><span className="badge badge-success">Settle Cash</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td><strong>Evergreen Property Trust</strong></td>
                            <td>2026-07-10 (Overdue)</td>
                            <td>Extended +3 Years @ 4.8%</td>
                            <td><span className="text-red">No Sign-off</span></td>
                            <td><span className="badge badge-danger">Unresolved Extension</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. Instrument Master Governance (Signature) */}
              {activeTab === "instrument_master_governance" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Instrument Master Static Data Audit</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>ISIN</th>
                            <th>Issuer</th>
                            <th>Asset Class</th>
                            <th>Credit Rating (S&P/Moody's)</th>
                            <th>Allowed per IPS</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>US88160R1014</td>
                            <td>Tesla Inc.</td>
                            <td>Corporate Bond</td>
                            <td>BBB / Baa2</td>
                            <td><span className="badge badge-success">Yes</span></td>
                          </tr>
                          <tr className="breached-row">
                            <td>US92532F1003</td>
                            <td>Vertex Pharma</td>
                            <td>Commercial Paper</td>
                            <td><span className="text-red">BBB+ / Baa1 (Downgraded)</span></td>
                            <td><span className="badge badge-danger">No (Rating Below A-)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. Realised Gain/Loss Testing (Signature) */}
              {activeTab === "realised_gain_loss" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Realised Gain/Loss Audit Sheet</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Sold security</th>
                            <th>Sale date</th>
                            <th>Proceeds</th>
                            <th>Calculated cost (FIFO)</th>
                            <th>Reported Gain/Loss</th>
                            <th>Auditor Recomputed</th>
                            <th>Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Apple Inc. Bond (Partial Sale)</td>
                            <td>2026-06-15</td>
                            <td>$5,100,000</td>
                            <td>$5,000,000</td>
                            <td>+$100,000</td>
                            <td>+$100,000</td>
                            <td>$0 <span className="badge badge-success">Match</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. Mandate & Policy Compliance (Signature) */}
              {activeTab === "mandate_policy" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Investment Policy Statement (IPS) Mandates Compliance Checklist</h3>
                    
                    <ul className="compliance-checklist">
                      <li>
                        <CheckCircle size={18} className="text-green" />
                        <span>Maximum Equity Exposure limit &lt; 15% (Current: 8.2%) - <strong>Compliant</strong></span>
                      </li>
                      <li>
                        <AlertTriangle size={18} className="text-red" />
                        <span>Minimum Credit Quality of debt assets &gt; A- (Breach: Vertex Pharma Downgraded to BBB+) - <strong>Breach</strong></span>
                      </li>
                      <li>
                        <CheckCircle size={18} className="text-green" />
                        <span>Minimum liquid assets pool &gt; $20,000,000 (Current: $24,500,000) - <strong>Compliant</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 12. Accrued Income Ageing (Signature) */}
              {activeTab === "accrued_income_ageing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Accrued Interest Income Ageing Schedule</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Interest Accrued</th>
                            <th>Not Due yet</th>
                            <th>1-30 Days Overdue</th>
                            <th>31-90 Days Overdue</th>
                            <th>90+ Days Overdue</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>JPMorgan Certificate of Deposit</td>
                            <td>$110,000</td>
                            <td>$110,000</td>
                            <td>$0</td>
                            <td>$0</td>
                            <td>$0</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Evergreen Property Trust Bond</td>
                            <td>$84,000</td>
                            <td>$0</td>
                            <td>$0</td>
                            <td>$84,000</td>
                            <td>$0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 13. Impairment Trigger Screening (Signature) */}
              {activeTab === "impairment_screening" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>ECL Stage Classification & Impairment Screening</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Holding Value</th>
                            <th>S&P Rating</th>
                            <th>Stage (IFRS 9)</th>
                            <th>Impairment Triggered</th>
                            <th>Provision Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>NextEra Energy Green Bond</td>
                            <td>$14,000,000</td>
                            <td>A+</td>
                            <td>Stage 1</td>
                            <td>No</td>
                            <td>$0</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Vertex Pharma Paper</td>
                            <td>$8,000,000</td>
                            <td>BBB+</td>
                            <td>Stage 2 (Significant Increase in Credit Risk)</td>
                            <td><span className="text-red font-bold">Yes</span></td>
                            <td>$160,000 (2.0%)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 14. Pledged / Lien Investments (Signature) */}
              {activeTab === "pledged_lien" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Encumbered Securities and Lien Registry</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Pledged Asset</th>
                            <th>Pledged Value</th>
                            <th>Lienholder (Bank)</th>
                            <th>Purpose / Loan Facility</th>
                            <th>Board Authorization Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Microsoft Corp Note</td>
                            <td>$10,000,000</td>
                            <td>HSBC Bank</td>
                            <td>Working Capital Overdraft Margin</td>
                            <td>2025-10-12</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 15. Broker & Dealing Controls (Signature) */}
              {activeTab === "broker_dealing" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>Broker Empanelment & Allocation Auditing</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Broker Name</th>
                            <th>Empaneled Status</th>
                            <th>Transaction Volume (YTD)</th>
                            <th>Share %</th>
                            <th>Commission Paid</th>
                            <th>Avg Commission Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Morgan Stanley India</td>
                            <td>Empaneled</td>
                            <td>$45,000,000</td>
                            <td>42.0%</td>
                            <td>$45,000</td>
                            <td>0.10%</td>
                          </tr>
                          <tr>
                            <td>Goldman Sachs Brokerage</td>
                            <td>Empaneled</td>
                            <td>$35,000,000</td>
                            <td>33.0%</td>
                            <td>$35,000</td>
                            <td>0.10%</td>
                          </tr>
                          <tr className="breached-row">
                            <td>Alpha Global Dealing Desk</td>
                            <td><span className="text-red font-bold">Not Empaneled</span></td>
                            <td>$25,000,000</td>
                            <td>25.0%</td>
                            <td>$37,500</td>
                            <td><span className="text-red font-bold">0.15% (Exceeds Policy Cap)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 16. Disclosure & Classification (Signature) */}
              {activeTab === "disclosure_classification" && (
                <div className="procedure-view">
                  <div className="card">
                    <h3>IFRS 9 Classification (FVTPL vs FVOCI vs Amortized Cost)</h3>
                    
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security</th>
                            <th>Business Model Assessment</th>
                            <th>SPPI Test Result</th>
                            <th>Accounting Classification</th>
                            <th>Appropriate?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>JPMorgan Cert of Deposit</td>
                            <td>Hold to Collect Cash Flows</td>
                            <td>Pass (Solely Principal & Interest)</td>
                            <td>Amortized Cost</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                          <tr>
                            <td>Apex Global Equities</td>
                            <td>Trading / Capital Appreciation</td>
                            <td>Fail (Equity Dividends)</td>
                            <td>FVTPL (Fair Value through P&L)</td>
                            <td><span className="badge badge-success">Passed</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 17. Scope & Audit Universe (Shell) */}
              {activeTab === "scope_universe" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="card-head">
                      <h3>Auditable Universe Scope Configuration</h3>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert("Creating new auditable unit...")}>
                        Add Unit <Plus size={14} />
                      </button>
                    </div>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Auditable Unit</th>
                            <th>Risk Category</th>
                            <th>Last Audit Date</th>
                            <th>Lead Auditor</th>
                            <th>In Scope?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Corporate Treasury Operations</td>
                            <td><span className="badge badge-danger">High Risk</span></td>
                            <td>2025-06-30</td>
                            <td>Sarah Jenkins</td>
                            <td><span className="text-green font-bold">Yes (Primary)</span></td>
                          </tr>
                          <tr>
                            <td>Offshore Subsidiary Holdings</td>
                            <td><span className="badge badge-warning">Medium Risk</span></td>
                            <td>2025-12-15</td>
                            <td>David Miller</td>
                            <td><span className="text-green font-bold">Yes</span></td>
                          </tr>
                          <tr>
                            <td>Commercial Paper Liquidity Pool</td>
                            <td><span className="badge badge-success">Low Risk</span></td>
                            <td>2024-11-22</td>
                            <td>Emily Watson</td>
                            <td><span className="text-muted">No (Cycle Out)</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 18. Risk & Control Matrix (Shell) */}
              {activeTab === "rcm_matrix" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Risk & Control Matrix (RCM) Index</h3>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Risk Ref</th>
                            <th>Risk Statement</th>
                            <th>Control Ref</th>
                            <th>Control Statement</th>
                            <th>Assertion</th>
                            <th>Owner</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>RSK-INV-01</strong></td>
                            <td>Securities in books do not exist in custody (Demat).</td>
                            <td><strong>CON-INV-01</strong></td>
                            <td>Monthly custody reconciliation to Demat statements.</td>
                            <td>Existence / Completeness</td>
                            <td>Treasury Manager</td>
                          </tr>
                          <tr>
                            <td><strong>RSK-INV-02</strong></td>
                            <td>Securities are carried above fair market value.</td>
                            <td><strong>CON-INV-02</strong></td>
                            <td>Independent pricing validation and impairment evaluation.</td>
                            <td>Valuation / Allocation</td>
                            <td>CFO Office</td>
                          </tr>
                          <tr>
                            <td><strong>RSK-INV-03</strong></td>
                            <td>Concentration exceeds policy limits leading to market loss.</td>
                            <td><strong>CON-INV-03</strong></td>
                            <td>Automated sector exposure cap controls in ERP.</td>
                            <td>Valuation</td>
                            <td>Compliance Head</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 19. Test & Analytics Rule Library (Shell) */}
              {activeTab === "test_rule_library" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Test Analytics and Rule Threshold Library</h3>
                    <div className="rule-grid">
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Single Issuer Exposure Threshold</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Triggers exception if single security exceeds defined percent of total portfolio size.</p>
                        <div className="rule-threshold">Threshold Limit: 10.0%</div>
                      </div>
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Minimum Issuer Credit Rating Check</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Triggers warning if held security drops below minimum credit standard.</p>
                        <div className="rule-threshold">Minimum Rating: A- (S&P)</div>
                      </div>
                      <div className="rule-card">
                        <div className="rule-header">
                          <h5>Dividend Receipt Variance Test</h5>
                          <span className="badge badge-success">Active</span>
                        </div>
                        <p>Recomputes dividend income and flags if difference exceeds expectation.</p>
                        <div className="rule-threshold">Tolerance Limit: 1.0%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 20. Data Source & Connector Setup (Shell) */}
              {activeTab === "data_connector_setup" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Data Feeds & API Integration Setup</h3>
                    <div className="connector-rows">
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>Bloomberg Pricing API Connector</strong>
                          <span>Sync Status: <span className="text-green font-bold">Online</span> (Last sync: 2 hours ago)</span>
                        </div>
                        <span className="badge badge-success">Connected</span>
                      </div>
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>BNY Mellon Custody Portal Connector</strong>
                          <span>Sync Status: <span className="text-green font-bold">Online</span> (Last sync: 1 day ago)</span>
                        </div>
                        <span className="badge badge-success">Connected</span>
                      </div>
                      <div className="connector-item">
                        <div className="connector-meta">
                          <strong>SAP S/4HANA Treasury Ledger Upload</strong>
                          <span>Sync Status: <span className="text-warning font-bold">Manual Sync Required</span></span>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => alert("Simulating SAP file sync...")}>Sync Now</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 21. Sampling & Population Builder (Shell & Simulation execution panel) */}
              {activeTab === "sampling_builder" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Simulation Controls: Sample & Population Tester</h3>
                    <p className="section-instruction">Select an audit procedure, configure verification constraints, and start the automated compliance agent. The agent will read mock custodial ledger logs, apply compliance thresholds, and flag exceptions.</p>

                    <form className="simulation-form border-glow" onSubmit={handleRunSimulation}>
                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Verify Procedure</label>
                          <select value={simProcedure} onChange={(e) => setSimProcedure(e.target.value)} disabled={simRunning}>
                            {SIGNATURE_PAGES.map(p => (
                              <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Statistical Sample Size</label>
                          <input
                            type="number"
                            min="2"
                            max="50"
                            value={simSampleSize}
                            onChange={(e) => setSimSampleSize(Number(e.target.value))}
                            disabled={simRunning}
                          />
                        </div>
                        <div className="form-group">
                          <label>Tolerance Limit (0.01 - 0.50)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="0.50"
                            value={simTolerance}
                            onChange={(e) => setSimTolerance(Number(e.target.value))}
                            disabled={simRunning}
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary w-full" disabled={simRunning}>
                        {simRunning ? (
                          <>
                            <RefreshCw className="spinner" size={16} /> Executing Simulation...
                          </>
                        ) : (
                          <>
                            <Play size={16} /> Run Automated Audit Procedure
                          </>
                        )}
                      </button>
                    </form>

                    {/* Simulation logs console */}
                    {(simLogs.length > 0 || simRunning) && (
                      <div className="simulation-terminal mt-4">
                        <div className="terminal-header">
                          <Terminal size={14} />
                          <span>Audit Verification Console Logs</span>
                        </div>
                        <div className="terminal-body">
                          {simLogs.map((log, i) => (
                            <div key={i} className="terminal-line">
                              <span className="line-prefix">&gt;</span> {log}
                            </div>
                          ))}
                          {simRunning && (
                            <div className="terminal-line typing">
                              <span className="line-prefix">&gt;</span> <span className="cursor">█</span>
                            </div>
                          )}
                          <div ref={consoleEndRef} />
                        </div>
                      </div>
                    )}

                    {/* Simulation result panel */}
                    {simResult && (
                      <div className={`simulation-result-card mt-4 ${simResult.status === "PASSED" ? "success" : "failed"}`}>
                        <div className="result-head">
                          <h4>Procedure Simulation: {simResult.status}</h4>
                          <span className={`badge ${simResult.status === "PASSED" ? "badge-success" : "badge-danger"}`}>
                            {simResult.status}
                          </span>
                        </div>
                        <div className="result-stats">
                          <div className="res-stat-col">
                            <span className="res-label">Deviation Count</span>
                            <span className="res-val">{simResult.deviations_count} / {simResult.sample_size}</span>
                          </div>
                          <div className="res-stat-col">
                            <span className="res-label">Deviation Rate</span>
                            <span className="res-val">{(simResult.deviation_rate * 100).toFixed(1)}%</span>
                          </div>
                          <div className="res-stat-col">
                            <span className="res-label">Configured Tolerance</span>
                            <span className="res-val">{(simResult.tolerance * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <p className="result-msg">
                          {simResult.status === "FAILED"
                            ? "CRITICAL: The verification deviation rate exceeds the allowed tolerance standard. The anomalous occurrences have been logged to the Exceptions Queue."
                            : "SUCCESS: The sample deviation rate lies within control limits. The procedure has concluded successfully."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 22. Exception & Red-Flag Queue (Shell & DB action integrated) */}
              {activeTab === "exception_queue" && (
                <div className="procedure-view">
                  <div className="card">
                    <div className="card-head">
                      <h3>Securities Exception Triage Queue</h3>
                      <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                        Reload Queue <RefreshCw size={14} />
                      </button>
                    </div>
                    
                    <p className="section-instruction">Selectively resolve exceptions that have been verified, adjusted, or cleared by the treasury desk.</p>

                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Security Description</th>
                            <th>Amount</th>
                            <th>Identified Mismatch / Exception Description</th>
                            <th>Report Date</th>
                            <th>Severity</th>
                            <th>Status</th>
                            <th>Triage Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exceptions.map((e) => (
                            <tr key={e.id} className={e.status !== "Resolved" ? "unresolved-row" : "resolved-row-dim"}>
                              <td><strong>{e.security}</strong></td>
                              <td>{e.amount}</td>
                              <td><span className="text-muted-desc">{e.exception}</span></td>
                              <td>{e.date}</td>
                              <td>
                                <span className={`badge ${e.severity === "High" ? "badge-danger" : "badge-warning"}`}>
                                  {e.severity}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${e.status === "Resolved" ? "badge-success" : e.status === "In Review" ? "badge-warning" : "badge-danger"}`}>
                                  {e.status}
                                </span>
                              </td>
                              <td>
                                {e.status !== "Resolved" ? (
                                  <button className="btn btn-secondary btn-sm text-green-btn" onClick={() => handleResolve(e.id)}>
                                    Mark Resolved
                                  </button>
                                ) : (
                                  <span className="text-green text-sm font-bold flex-align-center"><Check size={14} /> Cleared</span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {exceptions.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center text-muted">No exceptions reported for this tenant.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 23. Working Papers & Evidence (Shell) */}
              {activeTab === "working_papers" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Working Papers & Audit Documentation Locker</h3>
                    <div className="upload-box-wrapper" onClick={() => alert("Triggering file browser upload...")}>
                      <div className="upload-box">
                        <FileSpreadsheet size={32} className="upload-icon" />
                        <span>Drag & Drop excel spreadsheets, PDF statement confirmation letters, or screenshots here.</span>
                        <span className="upload-subtext">Supports XLSX, CSV, PDF up to 25MB</span>
                      </div>
                    </div>

                    <h4 className="mt-4">Attached Evidence Register</h4>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Document Name</th>
                            <th>Reference Task</th>
                            <th>Attached By</th>
                            <th>Upload Date</th>
                            <th>Size</th>
                            <th>Sign-off Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Demat_Custodian_Stmt_June2026.pdf</td>
                            <td>Holdings vs Custodian Reconciliation</td>
                            <td>John Doe</td>
                            <td>2026-07-02</td>
                            <td>12.4 MB</td>
                            <td><span className="badge badge-success">Approved by Lead</span></td>
                          </tr>
                          <tr>
                            <td>Bloomberg_Price_Validation_Q2.xlsx</td>
                            <td>Valuation & Fair-Value Testing</td>
                            <td>Sarah Jenkins</td>
                            <td>2026-07-05</td>
                            <td>4.2 MB</td>
                            <td><span className="badge badge-warning">Awaiting Review</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 24. Observation & Finding Log (Shell) */}
              {activeTab === "observation_log" && (
                <div className="shell-view">
                  <div className="card">
                    <div className="card-head">
                      <h3>Formal Audit Findings and Observations</h3>
                      <button className="btn btn-secondary btn-sm" onClick={() => alert("Creating new draft finding...")}>Raise Finding <Plus size={14} /></button>
                    </div>
                    
                    <div className="findings-rows">
                      <div className="finding-item border-glow">
                        <div className="finding-meta">
                          <span className="finding-ref">OBS-INV-001</span>
                          <span className="badge badge-danger">High Severity</span>
                        </div>
                        <h4>Lack of board committee resolution for investment transaction above delegated limit.</h4>
                        <p>Tesla Inc. corporate debt purchase of $12.5M was executed with CFO authorization only, breaching the delegated authority cap of $5M.</p>
                        <div className="finding-footer">
                          <span>Owner: CFO Office</span>
                          <span>Target Close Date: 2026-08-30</span>
                        </div>
                      </div>
                      
                      <div className="finding-item border-glow">
                        <div className="finding-meta">
                          <span className="finding-ref">OBS-INV-002</span>
                          <span className="badge badge-warning">Medium Severity</span>
                        </div>
                        <h4>Credit Rating Downgrade not monitored under IPS constraints.</h4>
                        <p>Vertex Pharma commercial paper downgraded to BBB+, falling below investment policy guidelines without timely exit or special waiver.</p>
                        <div className="finding-footer">
                          <span>Owner: Risk Management Desk</span>
                          <span>Target Close Date: 2026-09-15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 25. Remediation / Action Tracker (Shell) */}
              {activeTab === "remediation_tracker" && (
                <div className="shell-view">
                  <div className="card">
                    <h3>Remediation & CAPA Action Plans</h3>
                    <div className="audit-table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Finding Ref</th>
                            <th>Action Plan Statement</th>
                            <th>Remediation Owner</th>
                            <th>Target Date</th>
                            <th>Remediation Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>OBS-INV-001</td>
                            <td>Submit retroactive board approval resolution and revise ERP workflow validation rules.</td>
                            <td>Chief Financial Officer</td>
                            <td>2026-08-30</td>
                            <td><span className="badge badge-warning">In Progress</span></td>
                          </tr>
                          <tr>
                            <td>OBS-INV-002</td>
                            <td>Divest Vertex paper or obtain formal waiver from the Board Risk Committee.</td>
                            <td>Head of Treasury</td>
                            <td>2026-09-15</td>
                            <td><span className="badge badge-danger">Pending Review</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>

      </div>
    </div>
  );
}
