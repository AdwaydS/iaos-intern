import { lazy, Suspense, useState } from "react";

const TAB_GROUPS = [
  {
    label: "Signature",
    tabs: [
      { key: "afe", label: "AFE / Budget Compliance", num: 1 },
      { key: "cost_overrun", label: "Cost-Overrun Tracking", num: 2 },
      { key: "schedule_overrun", label: "Schedule / Time-Overrun", num: 3 },
      { key: "cap_timing", label: "Capitalisation Timing", num: 4 },
      { key: "quotes", label: "Competitive-Quote Governance", num: 5 },
      { key: "cwip_trace", label: "Capex-to-CWIP-to-FA Trace", num: 6 },
      { key: "milestone_payment", label: "Milestone-Based Payment", num: 7 },
      { key: "change_order", label: "Change-Order Control", num: 8 },
      { key: "contractor_advance", label: "Contractor Advance Recovery", num: 9 },
      { key: "retention_ld", label: "Retention & LD Management", num: 10 },
      { key: "idle_capex", label: "Idle / Abandoned Capex", num: 11 },
      { key: "capex_roi", label: "Capex ROI / Post-Completion", num: 12 },
      { key: "po_splitting", label: "Multiple-PO Splitting", num: 13 },
      { key: "cashflow", label: "Project Cash-Flow Monitoring", num: 14 },
      { key: "vendor_perf", label: "Vendor Performance on Projects", num: 15 },
    ],
  },
  {
    label: "Shell",
    tabs: [
      { key: "dashboard", label: "Module Dashboard & KPIs", num: 16 },
      { key: "scope", label: "Scope & Audit Universe", num: 17 },
      { key: "rcm", label: "Risk & Control Matrix (RCM)", num: 18 },
      { key: "analytics", label: "Test & Analytics Rule Library", num: 19 },
      { key: "data_sources", label: "Data Source & Connector Setup", num: 20 },
      { key: "sampling", label: "Sampling & Population Builder", num: 21 },
      { key: "exceptions", label: "Exception & Red-Flag Queue", num: 22 },
      { key: "working_papers", label: "Working Papers & Evidence", num: 23 },
      { key: "findings", label: "Observation & Finding Log", num: 24 },
      { key: "remediation", label: "Remediation / Action Tracker", num: 25 },
    ],
  },
];

const COMPONENTS: Record<string, React.LazyExoticComponent<React.FC>> = {
  afe: lazy(() => import("./tabs/Afe")),
  cost_overrun: lazy(() => import("./tabs/CostOverrun")),
  schedule_overrun: lazy(() => import("./tabs/ScheduleOverrun")),
  cap_timing: lazy(() => import("./tabs/CapTiming")),
  quotes: lazy(() => import("./tabs/Quotes")),
  cwip_trace: lazy(() => import("./tabs/CwipTrace")),
  milestone_payment: lazy(() => import("./tabs/MilestonePayment")),
  change_order: lazy(() => import("./tabs/ChangeOrder")),
  contractor_advance: lazy(() => import("./tabs/ContractorAdvance")),
  retention_ld: lazy(() => import("./tabs/RetentionLd")),
  idle_capex: lazy(() => import("./tabs/IdleCapex")),
  capex_roi: lazy(() => import("./tabs/CapexRoi")),
  po_splitting: lazy(() => import("./tabs/PoSplitting")),
  cashflow: lazy(() => import("./tabs/Cashflow")),
  vendor_perf: lazy(() => import("./tabs/VendorPerf")),
  dashboard: lazy(() => import("./tabs/Dashboard")),
  scope: lazy(() => import("./tabs/Scope")),
  rcm: lazy(() => import("./tabs/RCM")),
  analytics: lazy(() => import("./tabs/Analytics")),
  data_sources: lazy(() => import("./tabs/DataSources")),
  sampling: lazy(() => import("./tabs/Sampling")),
  exceptions: lazy(() => import("./tabs/Exceptions")),
  working_papers: lazy(() => import("./tabs/WorkingPapers")),
  findings: lazy(() => import("./tabs/Findings")),
  remediation: lazy(() => import("./tabs/Remediation")),
};

export default function CapexProjectsPage() {
  const [active, setActive] = useState("dashboard");
  const ActiveComponent = COMPONENTS[active];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {TAB_GROUPS.map((group) =>
          group.tabs.map((t) => (
            <button
              key={t.key}
              className={`btn ${active === t.key ? "btn-navy" : "btn-ghost"}`}
              style={{ padding: "6px 14px", fontSize: 12 }}
              onClick={() => setActive(t.key)}
            >
              {t.num}. {t.label}
            </button>
          ))
        )}
      </div>
      <Suspense fallback={<p>Loading...</p>}>
        {ActiveComponent && <ActiveComponent />}
      </Suspense>
    </div>
  );
}
