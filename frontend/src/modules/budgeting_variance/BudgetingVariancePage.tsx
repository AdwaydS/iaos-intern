import { lazy, Suspense, useState } from "react";
import { Icon } from "../../components/Icon";
import Breadcrumb from "./components/Breadcrumb";
import { SUB_PAGES } from "./constants/pages";
import { LoadingState } from "./components/StateViews";
import "./budgeting.css";

const DashboardView = lazy(() => import("./views/DashboardView"));
const BudgetVsActualView = lazy(() => import("./views/BudgetVsActualView"));
const PreApprovalTimingView = lazy(() => import("./views/PreApprovalTimingView"));
const ChronicOverspendView = lazy(() => import("./views/ChronicOverspendView"));
const RebudgetRevisionView = lazy(() => import("./views/RebudgetRevisionView"));
const AssumptionReasonablenessView = lazy(() => import("./views/AssumptionReasonablenessView"));
const FlashVsFinalView = lazy(() => import("./views/FlashVsFinalView"));
const RollingForecastView = lazy(() => import("./views/RollingForecastView"));
const ZeroBasedBudgetView = lazy(() => import("./views/ZeroBasedBudgetView"));
const CapexUtilisationView = lazy(() => import("./views/CapexUtilisationView"));
const DepartmentalScorecardView = lazy(() => import("./views/DepartmentalScorecardView"));
const UnspentParkedView = lazy(() => import("./views/UnspentParkedView"));
const CostDriverTrendView = lazy(() => import("./views/CostDriverTrendView"));
const ContingencyReserveView = lazy(() => import("./views/ContingencyReserveView"));
const ForecastBiasView = lazy(() => import("./views/ForecastBiasView"));
const ApprovalAuditTrailView = lazy(() => import("./views/ApprovalAuditTrailView"));
const ScopeUniverseView = lazy(() => import("./views/ScopeUniverseView"));
const RCMView = lazy(() => import("./views/RCMView"));
const RuleLibraryView = lazy(() => import("./views/RuleLibraryView"));
const DataSourceView = lazy(() => import("./views/DataSourceView"));
const SamplingBuilderView = lazy(() => import("./views/SamplingBuilderView"));
const ExceptionQueueView = lazy(() => import("./views/ExceptionQueueView"));
const WorkingPapersView = lazy(() => import("./views/WorkingPapersView"));
const FindingLogView = lazy(() => import("./views/FindingLogView"));
const ActionTrackerView = lazy(() => import("./views/ActionTrackerView"));

const VIEW_MAP: Record<number, React.ComponentType<{ onNavigate?: (id: number) => void }>> = {
  1: DashboardView as any,
  2: BudgetVsActualView,
  3: PreApprovalTimingView,
  4: ChronicOverspendView,
  5: RebudgetRevisionView,
  6: AssumptionReasonablenessView,
  7: FlashVsFinalView,
  8: RollingForecastView,
  9: ZeroBasedBudgetView,
  10: CapexUtilisationView,
  11: DepartmentalScorecardView,
  12: UnspentParkedView,
  13: CostDriverTrendView,
  14: ContingencyReserveView,
  15: ForecastBiasView,
  16: ApprovalAuditTrailView,
  17: ScopeUniverseView,
  18: RCMView,
  19: RuleLibraryView,
  20: DataSourceView,
  21: SamplingBuilderView,
  22: ExceptionQueueView,
  23: WorkingPapersView,
  24: FindingLogView,
  25: ActionTrackerView,
};

export default function BudgetingVariancePage() {
  const [selectedPageId, setSelectedPageId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({ analysis: true, framework: true });

  const activePage = SUB_PAGES.find((p) => p.id === selectedPageId) ?? SUB_PAGES[0];
  const ActiveView = VIEW_MAP[selectedPageId] ?? DashboardView;

  const filtered = SUB_PAGES.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const analysisPages = filtered.filter((p) => p.category === "analysis");
  const frameworkPages = filtered.filter((p) => p.category === "framework");

  const categoryLabel = activePage.category === "analysis"
    ? "Budget Analysis & Variance"
    : "Audit & Compliance Framework";

  return (
    <div>
      <div className="page-head">
        <h1>Budgeting & Variance Analysis</h1>
        <p>Module 27 — KPI dashboards, variance analytics, exception queue, RCM, and working-papers evidence tracking.</p>
      </div>

      <div className="bgt-layout">
        <aside className="card bgt-subnav">
          <div className="bgt-subnav-search">
            <input
              className="input"
              placeholder="Search sub-pages…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Icon name="dashboard" size={16} />
          </div>

          <div className="bgt-subnav-groups">
            <SubNavGroup
              label={`Budget Analysis (${analysisPages.length})`}
              expanded={expandedGroups.analysis}
              onToggle={() => setExpandedGroups((g) => ({ ...g, analysis: !g.analysis }))}
              pages={analysisPages}
              selectedId={selectedPageId}
              onSelect={setSelectedPageId}
            />
            <SubNavGroup
              label={`Audit Framework (${frameworkPages.length})`}
              expanded={expandedGroups.framework}
              onToggle={() => setExpandedGroups((g) => ({ ...g, framework: !g.framework }))}
              pages={frameworkPages}
              selectedId={selectedPageId}
              onSelect={setSelectedPageId}
            />
          </div>
        </aside>

        <main className="bgt-main">
          <Breadcrumb
            moduleTitle="Budgeting & Variance"
            pageName={activePage.name}
            category={categoryLabel}
            pageId={activePage.id}
          />
          <div className="bgt-page-header">
            <span className="badge badge-slate bgt-page-badge">
              {categoryLabel} — Page {activePage.id}
            </span>
            <h2>{activePage.name}</h2>
            <p>{activePage.description}</p>
          </div>

          <Suspense fallback={<LoadingState />}>
            {selectedPageId === 1 ? (
              <DashboardView onNavigate={setSelectedPageId} />
            ) : (
              <ActiveView />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function SubNavGroup({
  label, expanded, onToggle, pages, selectedId, onSelect,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  pages: typeof SUB_PAGES;
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="bgt-subnav-group">
      <button type="button" className="bgt-subnav-group-head" onClick={onToggle}>
        <span>{label}</span>
        <Icon
          name="chevron-right"
          size={14}
          style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.15s ease" }}
        />
      </button>
      {expanded && (
        <div className="bgt-subnav-items">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`bgt-subnav-btn${selectedId === p.id ? " active" : ""}`}
              onClick={() => onSelect(p.id)}
            >
              {p.id}. {p.name}
            </button>
          ))}
          {pages.length === 0 && (
            <span className="bgt-subnav-empty">No matching pages</span>
          )}
        </div>
      )}
    </div>
  );
}
