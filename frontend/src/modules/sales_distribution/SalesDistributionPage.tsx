import React, { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

const SLUG = "sales_distribution";

interface Kpis {
  total_sales_audited: number;
  scheme_leakage_identified: number;
  primary_secondary_mismatch_val: number;
  high_risk_red_flags: number;
  open_remediation_actions: number;
  active_distributors: number;
  claim_leakage_recovery_rate: number;
  audit_coverage_pct: number;
}

interface SubPageMeta {
  key: string;
  name: string;
  badge?: string;
}

interface CategoryGroup {
  name: string;
  icon: string;
  subPages: SubPageMeta[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    name: "Governance & Overview",
    icon: "📊",
    subPages: [
      { key: "module-dashboard-kpis", name: "Module Dashboard & KPIs" },
      { key: "scope-audit-universe", name: "Scope & Audit Universe" },
      { key: "risk-control-matrix-rcm", name: "Risk & Control Matrix (RCM)" },
    ],
  },
  {
    name: "Sales & Scheme Assurance",
    icon: "💰",
    subPages: [
      { key: "scheme-leakage", name: "Scheme & Discount Leakage", badge: "High Risk" },
      { key: "primary-vs-secondary", name: "Primary vs Secondary Sales" },
      { key: "distributor-claims", name: "Distributor Claim Validation" },
      { key: "price-realisation", name: "Price Realisation Analysis" },
      { key: "free-goods-sampling", name: "Free-Goods & Sampling" },
      { key: "rebate-incentive-payout", name: "Rebate & Incentive Payout" },
    ],
  },
  {
    name: "Commercial & Channel Audit",
    icon: "🏢",
    subPages: [
      { key: "credit-exposure-by-distributor", name: "Credit Exposure by Distributor" },
      { key: "stale-idle-distributors", name: "Stale / Idle Distributors" },
      { key: "cannibalisation-diversion", name: "Cannibalisation & Diversion" },
      { key: "channel-reconciliation", name: "Channel Reconciliation" },
      { key: "sales-return-damage", name: "Sales-Return & Damage" },
      { key: "sales-return-cut-off", name: "Sales-Return Cut-off" },
    ],
  },
  {
    name: "Field Ops & SLA Audit",
    icon: "🚚",
    subPages: [
      { key: "territory-beat-coverage", name: "Territory / Beat Coverage" },
      { key: "order-to-fulfilment-sla", name: "Order-to-Fulfilment SLA" },
      { key: "salesperson-performance", name: "Salesperson Performance" },
    ],
  },
  {
    name: "Analytics & Workpapers",
    icon: "⚡",
    subPages: [
      { key: "test-analytics-rule-library", name: "Test & Analytics Rule Library" },
      { key: "data-source-connector-setup", name: "Data Source & Connector Setup" },
      { key: "sampling-population-builder", name: "Sampling & Population Builder" },
      { key: "exception-red-flag-queue", name: "Exception & Red-Flag Queue", badge: "Red Flags" },
      { key: "working-papers-evidence", name: "Working Papers & Evidence" },
      { key: "observation-finding-log", name: "Observation & Finding Log" },
      { key: "remediation-action-tracker", name: "Remediation / Action Tracker" },
    ],
  },
];

export default function SalesDistributionPage() {
  const [activeSubPage, setActiveSubPage] = useState<string>("module-dashboard-kpis");
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAnalytics, setRunningAnalytics] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [statusNotification, setStatusNotification] = useState<string>("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Escalate form
  const [escalateTitle, setEscalateTitle] = useState("");
  const [escalateCategory, setEscalateCategory] = useState("Scheme Leakage");
  const [escalateSeverity, setEscalateSeverity] = useState("High");
  const [escalateImpact, setEscalateImpact] = useState<number>(150000);
  const [escalateRec, setEscalateRec] = useState("");
  const [escalateOwner, setEscalateOwner] = useState("Head of Sales Ops");

  // New item title/notes
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemNotes, setNewItemNotes] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const kpiRes = await get<Kpis>(`/api/modules/${SLUG}/kpis`);
      setKpis(kpiRes);

      const subRes = await get<any>(`/api/modules/${SLUG}/subpages/${activeSubPage}`);
      setPageData(subRes);
    } catch (err) {
      console.error("Failed to fetch Sales & Distribution data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeSubPage]);

  async function handleRunAnalytics() {
    setRunningAnalytics(true);
    try {
      const res = await post<any>(`/api/modules/${SLUG}/execute-analytics`, { threshold_amount: 50000 });
      setStatusNotification(res.message || "Audit analytics executed successfully!");
      await loadData();
      setTimeout(() => setStatusNotification(""), 5000);
    } catch (err) {
      console.error("Analytics execution failed:", err);
    } finally {
      setRunningAnalytics(false);
    }
  }

  async function handleEscalateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await post<any>(`/api/modules/${SLUG}/escalate-finding`, {
        title: escalateTitle,
        risk_category: escalateCategory,
        severity: escalateSeverity,
        financial_impact: escalateImpact,
        recommendation: escalateRec,
        action_owner: escalateOwner,
      });
      setStatusNotification(res.message);
      setShowEscalateModal(false);
      await loadData();
      setTimeout(() => setStatusNotification(""), 5000);
    } catch (err) {
      console.error("Escalation failed:", err);
    }
  }

  async function handleDeleteRecord(id: number) {
    if (!window.confirm("Are you sure you want to delete this audit record?")) return;
    try {
      await del(`/api/modules/${SLUG}/subpages/${activeSubPage}/item/${id}`);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    try {
      await post(`/api/modules/${SLUG}/items`, { title: newItemTitle, notes: newItemNotes });
      setNewItemTitle("");
      setNewItemNotes("");
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add audit record:", err);
    }
  }

  const activeMeta = CATEGORIES.flatMap((c) => c.subPages).find((s) => s.key === activeSubPage);

  const filteredItems = pageData?.items
    ? pageData.items.filter((it: any) =>
        JSON.stringify(it).toLowerCase().includes(searchFilter.toLowerCase())
      )
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 4 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          borderRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>📈</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Module 43: Sales & Distribution Assurance
            </h1>
            <span
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              Operations Core Domain
            </span>
          </div>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
            FastAPI & SQLAlchemy backend engine providing continuous assurance over scheme leakage, primary vs secondary reconciliation & pricing integrity.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn"
            style={{
              background: runningAnalytics ? "#2563eb" : "rgba(16, 185, 129, 0.2)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              padding: "8px 14px",
              fontWeight: 600,
            }}
            onClick={handleRunAnalytics}
            disabled={runningAnalytics}
          >
            {runningAnalytics ? "⚡ Running Rules..." : "⚡ Run Audit Analytics Engine"}
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: "8px 16px" }}
            onClick={() => setShowAddModal(true)}
          >
            ➕ Add Record
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotification && (
        <div
          style={{
            padding: "12px 16px",
            background: "#ecfdf5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>✅ {statusNotification}</span>
          <button
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#065f46", fontWeight: 700 }}
            onClick={() => setStatusNotification("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Total Audited Sales
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "var(--navy)" }}>
            {kpis ? `₹${(kpis.total_sales_audited / 1e9).toFixed(3)}B` : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>Coverage: {kpis?.audit_coverage_pct}%</div>
        </div>

        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #ef4444" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Scheme Leakage
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#ef4444" }}>
            {kpis ? `₹${(kpis.scheme_leakage_identified / 1e6).toFixed(1)}M` : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}>High Priority</div>
        </div>

        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Primary vs Sec. Gap
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#d97706" }}>
            {kpis ? `₹${(kpis.primary_secondary_mismatch_val / 1e6).toFixed(1)}M` : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "var(--slate)", marginTop: 2 }}>Stock Variance</div>
        </div>

        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #8b5cf6" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Distributors Audited
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "var(--navy)" }}>
            {kpis ? kpis.active_distributors : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>Recovery: {kpis?.claim_leakage_recovery_rate}%</div>
        </div>

        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #dc2626" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Red Flags Active
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "#dc2626" }}>
            {kpis ? kpis.high_risk_red_flags : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "#dc2626", marginTop: 2 }}>Requires Review</div>
        </div>

        <div className="card" style={{ padding: "14px 16px", borderLeft: "4px solid #10b981" }}>
          <div style={{ color: "var(--slate)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Open Remediation
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: "var(--navy)" }}>
            {kpis ? kpis.open_remediation_actions : "Loading..."}
          </div>
          <div style={{ fontSize: 11, color: "#3b82f6", marginTop: 2 }}>CAPA Tracked</div>
        </div>
      </div>

      {/* Workspace Layout: Left Sidebar + Right Subpage Workbench */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Left Sidebar Subpage Selector */}
        <div
          className="card"
          style={{
            padding: 14,
            maxHeight: "calc(100vh - 240px)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--navy)", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
            📋 Audit Sub-Pages (25)
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{cat.icon}</span> {cat.name}
              </div>

              {cat.subPages.map((sub) => {
                const isActive = activeSubPage === sub.key;
                return (
                  <button
                    key={sub.key}
                    onClick={() => setActiveSubPage(sub.key)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                      color: isActive ? "#2563eb" : "#334155",
                      border: isActive ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.name}
                    </span>
                    {sub.badge && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: sub.badge.includes("High") || sub.badge.includes("Red") ? "#fee2e2" : "#e0e7ff",
                          color: sub.badge.includes("High") || sub.badge.includes("Red") ? "#991b1b" : "#3730a3",
                          padding: "2px 6px",
                          borderRadius: 10,
                          marginLeft: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sub.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right Active Subpage Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header & Filter Bar */}
          <div
            className="card"
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>
                {pageData?.category || "Sales & Distribution Sub-Module"}
              </div>
              <h2 style={{ margin: "2px 0 0 0", fontSize: 18, color: "var(--navy)", fontWeight: 700 }}>
                {activeMeta?.name || "Sub-Page View"}
              </h2>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                className="input"
                type="text"
                placeholder="Filter audit records..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ width: 220, fontSize: 12 }}
              />
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: "6px 12px" }}
                onClick={() => setSearchFilter("")}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Dynamic Summary Cards */}
          {pageData?.summary_metrics && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(Object.keys(pageData.summary_metrics).length, 4)}, 1fr)`, gap: 12 }}>
              {Object.entries(pageData.summary_metrics).map(([mKey, mVal]) => (
                <div key={mKey} className="card" style={{ padding: "12px 14px", background: "#f8fafc" }}>
                  <div style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize" }}>
                    {mKey.replace(/_/g, " ")}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)", marginTop: 2 }}>
                    {String(mVal)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subpage Data Table */}
          <div className="card" style={{ overflow: "hidden" }}>
            {loading ? (
              <p style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>Loading audit records from database...</p>
            ) : filteredItems.length === 0 ? (
              <p style={{ padding: 24, textAlign: "center", color: "var(--slate)" }}>
                No records matching filter.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                      {Object.keys(filteredItems[0]).map((col) => (
                        <th key={col} style={{ padding: "10px 14px", textTransform: "capitalize", color: "#475569", fontWeight: 600 }}>
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                      <th style={{ padding: "10px 14px", textRight: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((row: any, idx: number) => (
                      <tr key={row.id || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {Object.entries(row).map(([colName, val]: [string, any], cIdx: number) => (
                          <td key={cIdx} style={{ padding: "10px 14px" }}>
                            {typeof val === "boolean" ? (
                              <span
                                style={{
                                  background: val ? "#dcfce7" : "#fee2e2",
                                  color: val ? "#166534" : "#991b1b",
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {val ? "Yes" : "No"}
                              </span>
                            ) : colName.toLowerCase().includes("status") || colName.toLowerCase().includes("risk") || colName.toLowerCase().includes("severity") ? (
                              <span
                                style={{
                                  background:
                                    String(val).includes("High") || String(val).includes("Flagged") || String(val).includes("Rejected") || String(val).includes("Critical")
                                      ? "#fee2e2"
                                      : String(val).includes("Verified") || String(val).includes("Active") || String(val).includes("Effective")
                                      ? "#dcfce7"
                                      : "#fef3c7",
                                  color:
                                    String(val).includes("High") || String(val).includes("Flagged") || String(val).includes("Rejected") || String(val).includes("Critical")
                                      ? "#991b1b"
                                      : String(val).includes("Verified") || String(val).includes("Active") || String(val).includes("Effective")
                                      ? "#166534"
                                      : "#92400e",
                                  padding: "2px 8px",
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {String(val)}
                              </span>
                            ) : typeof val === "number" && (colName.includes("claimed") || colName.includes("eligible") || colName.includes("leakage") || colName.includes("val") || colName.includes("turnover") || colName.includes("impact") || colName.includes("exposure") || colName.includes("rebate") || colName.includes("limit") || colName.includes("outstanding") || colName.includes("approved")) ? (
                              `₹${val.toLocaleString()}`
                            ) : (
                              String(val)
                            )}
                          </td>
                        ))}

                        <td style={{ padding: "10px 14px", whiteSpace: "nowrap", textAlign: "right" }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px 8px", fontSize: 11, marginRight: 6 }}
                            onClick={() => {
                              setSelectedRecord(row);
                              setEscalateTitle(row.scheme_name || row.description || row.title || `Audit Finding - ${activeMeta?.name}`);
                              setEscalateImpact(row.leakage_amount || row.financial_impact || row.variance_value || 150000);
                              setShowEscalateModal(true);
                            }}
                          >
                            ⚠️ Escalate Finding
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: "4px 8px", fontSize: 11, color: "#ef4444" }}
                            onClick={() => handleDeleteRecord(row.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escalate Finding Modal */}
      {showEscalateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: 480, padding: 24, background: "#fff" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--navy)" }}>⚠️ Escalate Anomaly to Audit Finding & CAPA</h3>
            <form onSubmit={handleEscalateSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Finding Title</label>
                <input
                  className="input"
                  value={escalateTitle}
                  onChange={(e) => setEscalateTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field">
                  <label>Risk Category</label>
                  <select
                    className="input"
                    value={escalateCategory}
                    onChange={(e) => setEscalateCategory(e.target.value)}
                  >
                    <option value="Scheme Leakage">Scheme Leakage</option>
                    <option value="Primary vs Secondary">Primary vs Secondary</option>
                    <option value="Distributor Claims">Distributor Claims</option>
                    <option value="Pricing Integrity">Pricing Integrity</option>
                    <option value="Credit Limit">Credit Limit Breach</option>
                  </select>
                </div>
                <div className="field">
                  <label>Severity Level</label>
                  <select
                    className="input"
                    value={escalateSeverity}
                    onChange={(e) => setEscalateSeverity(e.target.value)}
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Financial Impact (₹)</label>
                <input
                  className="input"
                  type="number"
                  value={escalateImpact}
                  onChange={(e) => setEscalateImpact(Number(e.target.value))}
                  required
                />
              </div>

              <div className="field">
                <label>Audit Recommendation</label>
                <textarea
                  className="input"
                  rows={2}
                  value={escalateRec}
                  onChange={(e) => setEscalateRec(e.target.value)}
                  placeholder="Recommend corrective action and internal control improvement..."
                  required
                />
              </div>

              <div className="field">
                <label>CAPA Action Owner</label>
                <input
                  className="input"
                  value={escalateOwner}
                  onChange={(e) => setEscalateOwner(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowEscalateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Finding & CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: 450, padding: 24, background: "#fff" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--navy)" }}>Add Audit Record</h3>
            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field">
                <label>Audit Record Title / Code</label>
                <input
                  className="input"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="e.g. SCH-2026-EX-99"
                  required
                />
              </div>

              <div className="field">
                <label>Auditor Field Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  placeholder="Detail observations, scheme leakage values, or exceptions..."
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Audit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
