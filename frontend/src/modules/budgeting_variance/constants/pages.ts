export type PageCategory = "analysis" | "framework";

export interface SubPageDef {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: PageCategory;
  icon: string;
}

export const SUB_PAGES: SubPageDef[] = [
  {
    id: 1,
    slug: "dashboard",
    name: "Dashboard & KPIs",
    description: "Executive overview of budget risk, variance hotspots, and audit coverage metrics.",
    category: "analysis",
    icon: "activity",
  },
  {
    id: 2,
    slug: "budget-vs-actual",
    name: "Budget vs Actual by Head",
    description: "Compare budgeted vs actual spend by cost head with variance analysis and trend indicators.",
    category: "analysis",
    icon: "wallet",
  },
  {
    id: 3,
    slug: "pre-approval-timing",
    name: "Pre-Approval Timing",
    description: "Assess whether budgets were approved before period start across cost centres.",
    category: "analysis",
    icon: "clipboard",
  },
  {
    id: 4,
    slug: "chronic-overspend",
    name: "Chronic Overspend Heads",
    description: "Identify cost heads consistently exceeding budget thresholds over multiple periods.",
    category: "analysis",
    icon: "alert-triangle",
  },
  {
    id: 5,
    slug: "rebudget-revision",
    name: "Re-budget / Revision Control",
    description: "Track budget revisions, re-allocations, and approval governance for mid-year changes.",
    category: "analysis",
    icon: "layers",
  },
  {
    id: 6,
    slug: "assumption-reasonableness",
    name: "Assumption Reasonableness",
    description: "Review budget assumptions against historical actuals and market benchmarks.",
    category: "analysis",
    icon: "file-check",
  },
  {
    id: 7,
    slug: "flash-vs-final",
    name: "Flash vs Final Variance",
    description: "Compare flash reporting variances against final close to detect late adjustments.",
    category: "analysis",
    icon: "trending-up",
  },
  {
    id: 8,
    slug: "rolling-forecast",
    name: "Rolling Forecast Review",
    description: "Monitor rolling forecast accuracy and update cadence by department.",
    category: "analysis",
    icon: "activity",
  },
  {
    id: 9,
    slug: "zero-based-budget",
    name: "Zero-Based Budget Support",
    description: "Support zero-based budgeting reviews with justification scoring and ranking.",
    category: "analysis",
    icon: "grid",
  },
  {
    id: 10,
    slug: "capex-utilisation",
    name: "Capex Budget Utilisation",
    description: "Analyse capital expenditure budget drawdown, slippage, and project-level utilisation.",
    category: "analysis",
    icon: "building",
  },
  {
    id: 11,
    slug: "departmental-scorecard",
    name: "Departmental Scorecard",
    description: "Composite budget performance scorecard across departments and business units.",
    category: "analysis",
    icon: "users",
  },
  {
    id: 12,
    slug: "unspent-parked",
    name: "Unspent / Parked Budget",
    description: "Detect year-end spend-it-or-lose-it patterns and parked budget releases.",
    category: "analysis",
    icon: "wallet",
  },
  {
    id: 13,
    slug: "cost-driver-trend",
    name: "Cost Driver Trend",
    description: "Decompose variances into volume, price, mix, exchange, and productivity drivers.",
    category: "analysis",
    icon: "trending-up",
  },
  {
    id: 14,
    slug: "contingency-reserve",
    name: "Contingency & Reserve Use",
    description: "Monitor contingency drawdowns, reserve approvals, and policy compliance.",
    category: "analysis",
    icon: "shield",
  },
  {
    id: 15,
    slug: "forecast-bias",
    name: "Forecast-to-Actual Bias",
    description: "Measure systematic over- or under-forecasting bias by period and cost centre.",
    category: "analysis",
    icon: "activity",
  },
  {
    id: 16,
    slug: "approval-audit-trail",
    name: "Budget Approval Audit Trail",
    description: "Immutable log of budget approval actions, sign-offs, and workflow timestamps.",
    category: "framework",
    icon: "clipboard",
  },
  {
    id: 17,
    slug: "scope-universe",
    name: "Scope & Audit Universe",
    description: "Define audit scope boundaries, in-scope entities, and universe coverage.",
    category: "framework",
    icon: "layers",
  },
  {
    id: 18,
    slug: "rcm",
    name: "Risk & Control Matrix (RCM)",
    description: "Map budget-related risks to controls, owners, and financial assertions.",
    category: "framework",
    icon: "shield",
  },
  {
    id: 19,
    slug: "rule-library",
    name: "Test & Analytics Rule Library",
    description: "CAAT rules and analytics tests applied to budget and variance data.",
    category: "framework",
    icon: "grid",
  },
  {
    id: 20,
    slug: "data-sources",
    name: "Data Source & Connector Setup",
    description: "ERP, FP&A, and data warehouse connectors feeding the audit module.",
    category: "framework",
    icon: "server",
  },
  {
    id: 21,
    slug: "sampling-builder",
    name: "Sampling & Population Builder",
    description: "Build audit populations and statistical samples for budget testing.",
    category: "framework",
    icon: "file-check",
  },
  {
    id: 22,
    slug: "exceptions",
    name: "Exception & Red Flag Queue",
    description: "Triage automated exceptions requiring auditor disposition and follow-up.",
    category: "framework",
    icon: "alert-triangle",
  },
  {
    id: 23,
    slug: "working-papers",
    name: "Working Papers & Evidence",
    description: "Upload, review, and sign-off budget audit working papers and evidence.",
    category: "framework",
    icon: "file-check",
  },
  {
    id: 24,
    slug: "findings",
    name: "Observation & Finding Log",
    description: "Document audit observations, findings, and management responses.",
    category: "framework",
    icon: "clipboard",
  },
  {
    id: 25,
    slug: "action-tracker",
    name: "Remediation / Action Tracker",
    description: "Track remediation actions, owners, due dates, and closure status.",
    category: "framework",
    icon: "check",
  },
];

export const DASHBOARD_WIDGET_LINKS: Record<string, number> = {
  "budget-vs-actual": 2,
  "cost-driver-trend": 13,
  "pre-approval-timing": 3,
  "chronic-overspend": 4,
  "forecast-bias": 15,
  "unspent-parked": 12,
};

export function findPage(id: number) {
  return SUB_PAGES.find((p) => p.id === id) ?? SUB_PAGES[0];
}

export function findPageBySlug(slug: string) {
  return SUB_PAGES.find((p) => p.slug === slug) ?? SUB_PAGES[0];
}
