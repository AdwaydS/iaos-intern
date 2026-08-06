import { useState, lazy, Suspense } from "react";
import { Icon } from "../../components/Icon";

// Lazy-loaded sub-pages
const IncomingInspectionView = lazy(() => import("./views/IncomingInspectionView"));
const InProcessQCView = lazy(() => import("./views/InProcessQCView"));
const FinalInspectionView = lazy(() => import("./views/FinalInspectionView"));
const RejectionTrendView = lazy(() => import("./views/RejectionTrendView"));
const COAView = lazy(() => import("./views/COAView"));
const CustomerComplaintView = lazy(() => import("./views/CustomerComplaintView"));
const SupplierQualityView = lazy(() => import("./views/SupplierQualityView"));
const NCRTrackingView = lazy(() => import("./views/NCRTrackingView"));
const ReworkScrapView = lazy(() => import("./views/ReworkScrapView"));
const CalibrationView = lazy(() => import("./views/CalibrationView"));
const DeviationCAPAView = lazy(() => import("./views/DeviationCAPAView"));
const BatchReleaseView = lazy(() => import("./views/BatchReleaseView"));
const RetentionSampleView = lazy(() => import("./views/RetentionSampleView"));
const COPQView = lazy(() => import("./views/COPQView"));
const AuditTrailView = lazy(() => import("./views/AuditTrailView"));
const ModuleDashboardView = lazy(() => import("./views/ModuleDashboardView"));
const ScopeUniverseView = lazy(() => import("./views/ScopeUniverseView"));
const RCMView = lazy(() => import("./views/RCMView"));
const RuleLibraryView = lazy(() => import("./views/RuleLibraryView"));
const DataSourceView = lazy(() => import("./views/DataSourceView"));
const SamplingBuilderView = lazy(() => import("./views/SamplingBuilderView"));
const ExceptionQueueView = lazy(() => import("./views/ExceptionQueueView"));
const WorkingPapersView = lazy(() => import("./views/WorkingPapersView"));
const FindingLogView = lazy(() => import("./views/FindingLogView"));
const ActionTrackerView = lazy(() => import("./views/ActionTrackerView"));

interface SubPage {
  id: number;
  name: string;
  category: "core" | "framework";
  view: React.ComponentType;
}

const SUB_PAGES: SubPage[] = [
  // Core Quality Operations
  { id: 1, name: "Incoming Inspection Coverage", category: "core", view: IncomingInspectionView },
  { id: 2, name: "In-Process QC Compliance", category: "core", view: InProcessQCView },
  { id: 3, name: "Final Inspection & Release", category: "core", view: FinalInspectionView },
  { id: 4, name: "Rejection Trend Analytics", category: "core", view: RejectionTrendView },
  { id: 5, name: "Certificate of Analysis (CoA)", category: "core", view: COAView },
  { id: 6, name: "Customer-Complaint Linkage", category: "core", view: CustomerComplaintView },
  { id: 7, name: "Supplier Quality Rating", category: "core", view: SupplierQualityView },
  { id: 8, name: "Non-Conformance (NCR) Tracking", category: "core", view: NCRTrackingView },
  { id: 9, name: "Rework vs Scrap Decision", category: "core", view: ReworkScrapView },
  { id: 10, name: "Calibration of Instruments", category: "core", view: CalibrationView },
  { id: 11, name: "Deviation & CAPA Log", category: "core", view: DeviationCAPAView },
  { id: 12, name: "Batch Release Controls", category: "core", view: BatchReleaseView },
  { id: 13, name: "Retention Sample Management", category: "core", view: RetentionSampleView },
  { id: 14, name: "Cost of Poor Quality", category: "core", view: COPQView },
  { id: 15, name: "Audit-Trail on QC Results", category: "core", view: AuditTrailView },

  // Audit & Compliance Framework
  { id: 16, name: "Module Dashboard & KPIs", category: "framework", view: ModuleDashboardView },
  { id: 17, name: "Scope & Audit Universe", category: "framework", view: ScopeUniverseView },
  { id: 18, name: "Risk & Control Matrix (RCM)", category: "framework", view: RCMView },
  { id: 19, name: "Test & Analytics Rule Library", category: "framework", view: RuleLibraryView },
  { id: 20, name: "Data Source & Connector Setup", category: "framework", view: DataSourceView },
  { id: 21, name: "Sampling & Population Builder", category: "framework", view: SamplingBuilderView },
  { id: 22, name: "Exception & Red-Flag Queue", category: "framework", view: ExceptionQueueView },
  { id: 23, name: "Working Papers & Evidence", category: "framework", view: WorkingPapersView },
  { id: 24, name: "Observation & Finding Log", category: "framework", view: FindingLogView },
  { id: 25, name: "Remediation / Action Tracker", category: "framework", view: ActionTrackerView },
];

export default function QualityControlRejectionsPage() {
  const [selectedPageId, setSelectedPageId] = useState<number>(16); // Default landing is Sub-page 16
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    core: true,
    framework: true,
  });

  const activeSubPage = SUB_PAGES.find((p) => p.id === selectedPageId) || SUB_PAGES[15];
  const ActiveView = activeSubPage.view;

  const filteredPages = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const corePages = filteredPages.filter((p) => p.category === "core");
  const frameworkPages = filteredPages.filter((p) => p.category === "framework");

  return (
    <div style={{ display: "flex", gap: 24, minHeight: "calc(100vh - 180px)", alignItems: "flex-start" }}>
      <style>{`
        .inner-subnav-btn {
          text-align: left;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13.5px;
          font-weight: 500;
          background: transparent;
          color: var(--slate);
          transition: all 0.1s ease;
          cursor: pointer;
          display: block;
          width: 100%;
          border: none;
        }
        .inner-subnav-btn:hover {
          background: var(--line-soft) !important;
          color: var(--navy);
        }
        .inner-subnav-btn.active {
          font-weight: 600;
          background: var(--navy-tint) !important;
          color: var(--navy) !important;
        }
      `}</style>

      {/* Inner Sub-Navigation Sidebar */}
      <div
        className="card"
        style={{
          width: 300,
          flexShrink: 0,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          height: "calc(100vh - 160px)",
          position: "sticky",
          top: 20,
          overflowY: "auto",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            className="input"
            style={{ paddingLeft: 36, fontSize: 13.5 }}
            placeholder="Search sub-pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ position: "absolute", left: 12, top: 12, color: "var(--slate-soft)", display: "flex" }}>
            <Icon name="dashboard" size={16} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Core Quality Operations Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, core: !g.core }))}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 8px",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--slate)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              <span>Core Quality Operations ({corePages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.core ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.core && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {corePages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {corePages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Audit & Compliance Framework Group */}
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, framework: !g.framework }))}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                justifyContent: "space-between",
                padding: "4px 8px",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--slate)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
            >
              <span>Audit & Compliance ({frameworkPages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.framework ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.framework && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {frameworkPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {frameworkPages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <span
            className="badge badge-slate"
            style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}
          >
            {activeSubPage.category === "core" ? "Core Quality Operations" : "Audit & Compliance Framework"} — Page {activeSubPage.id}
          </span>
          <h2 style={{ color: "var(--navy)" }}>{activeSubPage.name}</h2>
        </div>

        <Suspense
          fallback={
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--slate)" }}>
              Loading audit workspace...
            </div>
          }
        >
          <ActiveView />
        </Suspense>
      </div>
    </div>
  );
}
