import { useState, lazy, Suspense } from "react";
import { Icon } from "../../components/Icon";

const PosToBankReconciliationView = lazy(() => import("./views/PosToBankReconciliationView"));
const CashVarianceAnalyticsView = lazy(() => import("./views/CashVarianceAnalyticsView"));
const DiscountOverrideAbuseView = lazy(() => import("./views/DiscountOverrideAbuseView"));
const VoidRefundAnalyticsView = lazy(() => import("./views/VoidRefundAnalyticsView"));
const ShrinkageStockLossView = lazy(() => import("./views/ShrinkageStockLossView"));
const CardWalletSettlementView = lazy(() => import("./views/CardWalletSettlementView"));
const CashierExceptionReportView = lazy(() => import("./views/CashierExceptionReportView"));
const PriceIntegrityTestingView = lazy(() => import("./views/PriceIntegrityTestingView"));
const LoyaltyPointsAbuseView = lazy(() => import("./views/LoyaltyPointsAbuseView"));
const StoreToStoreTransferView = lazy(() => import("./views/StoreToStoreTransferView"));
const DamageExpiryWriteoffView = lazy(() => import("./views/DamageExpiryWriteoffView"));
const FootfallToConversionView = lazy(() => import("./views/FootfallToConversionView"));
const EmployeePurchaseControlsView = lazy(() => import("./views/EmployeePurchaseControlsView"));
const PettyCashFloatView = lazy(() => import("./views/PettyCashFloatView"));
const PhysicalCountVsSystemView = lazy(() => import("./views/PhysicalCountVsSystemView"));
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
  category: "signature" | "shell";
  view: React.ComponentType;
}

const SUB_PAGES: SubPage[] = [
  { id: 1, name: "POS-to-Bank Reconciliation", category: "signature", view: PosToBankReconciliationView },
  { id: 2, name: "Cash-Variance Analytics", category: "signature", view: CashVarianceAnalyticsView },
  { id: 3, name: "Discount & Override Abuse", category: "signature", view: DiscountOverrideAbuseView },
  { id: 4, name: "Void / Refund Analytics", category: "signature", view: VoidRefundAnalyticsView },
  { id: 5, name: "Shrinkage & Stock Loss", category: "signature", view: ShrinkageStockLossView },
  { id: 6, name: "Card / Wallet Settlement", category: "signature", view: CardWalletSettlementView },
  { id: 7, name: "Cashier Exception Report", category: "signature", view: CashierExceptionReportView },
  { id: 8, name: "Price-Integrity Testing", category: "signature", view: PriceIntegrityTestingView },
  { id: 9, name: "Loyalty / Points Abuse", category: "signature", view: LoyaltyPointsAbuseView },
  { id: 10, name: "Store-to-Store Transfer", category: "signature", view: StoreToStoreTransferView },
  { id: 11, name: "Damage / Expiry Write-off", category: "signature", view: DamageExpiryWriteoffView },
  { id: 12, name: "Footfall-to-Conversion", category: "signature", view: FootfallToConversionView },
  { id: 13, name: "Employee-Purchase Controls", category: "signature", view: EmployeePurchaseControlsView },
  { id: 14, name: "Petty-Cash & Float", category: "signature", view: PettyCashFloatView },
  { id: 15, name: "Physical-Count vs System", category: "signature", view: PhysicalCountVsSystemView },

  { id: 16, name: "Module Dashboard & KPIs", category: "shell", view: ModuleDashboardView },
  { id: 17, name: "Scope & Audit Universe", category: "shell", view: ScopeUniverseView },
  { id: 18, name: "Risk & Control Matrix (RCM)", category: "shell", view: RCMView },
  { id: 19, name: "Test & Analytics Rule Library", category: "shell", view: RuleLibraryView },
  { id: 20, name: "Data Source & Connector Setup", category: "shell", view: DataSourceView },
  { id: 21, name: "Sampling & Population Builder", category: "shell", view: SamplingBuilderView },
  { id: 22, name: "Exception & Red-Flag Queue", category: "shell", view: ExceptionQueueView },
  { id: 23, name: "Working Papers & Evidence", category: "shell", view: WorkingPapersView },
  { id: 24, name: "Observation & Finding Log", category: "shell", view: FindingLogView },
  { id: 25, name: "Remediation / Action Tracker", category: "shell", view: ActionTrackerView },
];

export default function PosStoreAuditPage() {
  const [selectedPageId, setSelectedPageId] = useState<number>(16);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({
    signature: true,
    shell: true,
  });

  const activeSubPage = SUB_PAGES.find((p) => p.id === selectedPageId) || SUB_PAGES[15];
  const ActiveView = activeSubPage.view;

  const filteredPages = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const signaturePages = filteredPages.filter((p) => p.category === "signature");
  const shellPages = filteredPages.filter((p) => p.category === "shell");

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
            <Icon name="filter" size={16} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, signature: !g.signature }))}
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
              <span>Signature Audit Procedures ({signaturePages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.signature ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.signature && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {signaturePages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {signaturePages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => setExpandedGroups((g) => ({ ...g, shell: !g.shell }))}
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
              <span>Audit & Compliance Framework ({shellPages.length})</span>
              <Icon
                name="chevron-right"
                size={14}
                style={{
                  transform: expandedGroups.shell ? "rotate(90deg)" : "none",
                  transition: "transform 0.15s ease",
                }}
              />
            </button>
            {expandedGroups.shell && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6, paddingLeft: 6 }}>
                {shellPages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPageId(p.id)}
                    className={`inner-subnav-btn ${selectedPageId === p.id ? "active" : ""}`}
                  >
                    {p.id}. {p.name}
                  </button>
                ))}
                {shellPages.length === 0 && (
                  <span style={{ fontSize: 12, color: "var(--slate-soft)", padding: "8px 12px" }}>
                    No matching pages
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <span
            className="badge badge-slate"
            style={{ marginBottom: 6, fontSize: 11, textTransform: "uppercase" }}
          >
            {activeSubPage.category === "signature" ? "Signature Audit Procedure" : "Audit & Compliance Framework"} — Page {activeSubPage.id}
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
