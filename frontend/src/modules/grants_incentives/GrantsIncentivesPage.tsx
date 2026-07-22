import { lazy, Suspense, useState } from "react";

const TAB_GROUPS = [
  {
    label: "Signature",
    tabs: [
      { key: "scheme_eligibility", label: "Scheme Eligibility", num: 1 },
      { key: "claim_accuracy", label: "Claim Accuracy", num: 2 },
      { key: "documentation", label: "Documentation", num: 3 },
      { key: "receipts", label: "Receipts & Ageing", num: 4 },
      { key: "conditions", label: "End-Use Compliance", num: 5 },
      { key: "export", label: "Export-Incentive", num: 6 },
      { key: "capital", label: "Capital Subsidy", num: 7 },
      { key: "interest", label: "Interest Subvention", num: 8 },
      { key: "accounting", label: "Accounting (Ind AS 20)", num: 9 },
      { key: "clawback", label: "Clawback Risk", num: 10 },
      { key: "deadlines", label: "Deadlines", num: 11 },
      { key: "overlaps", label: "Scheme Overlaps", num: 12 },
      { key: "correspondence", label: "Correspondence", num: 13 },
      { key: "utilisation", label: "Utilisation", num: 14 },
      { key: "realisation", label: "Realisation Dashboard", num: 15 },
    ],
  },
  {
    label: "Shell",
    tabs: [
      { key: "dashboard", label: "Module Dashboard", num: 16 },
      { key: "scope", label: "Scope & Audit Universe", num: 17 },
      { key: "rcm", label: "Risk & Control Matrix", num: 18 },
      { key: "analytics", label: "Analytics Rules", num: 19 },
      { key: "data_sources", label: "Data Sources", num: 20 },
      { key: "sampling", label: "Sampling", num: 21 },
      { key: "exceptions", label: "Exception Queue", num: 22 },
      { key: "working_papers", label: "Working Papers", num: 23 },
      { key: "findings", label: "Findings Log", num: 24 },
      { key: "remediation", label: "Remediation", num: 25 },
    ],
  },
];

const COMPONENTS: Record<string, React.LazyExoticComponent<React.FC>> = {
  scheme_eligibility: lazy(() => import("./tabs/SchemeEligibility")),
  claim_accuracy: lazy(() => import("./tabs/ClaimAccuracy")),
  documentation: lazy(() => import("./tabs/Documentation")),
  receipts: lazy(() => import("./tabs/Receipts")),
  conditions: lazy(() => import("./tabs/Conditions")),
  export: lazy(() => import("./tabs/ExportIncentive")),
  capital: lazy(() => import("./tabs/CapitalSubsidy")),
  interest: lazy(() => import("./tabs/InterestSubvention")),
  accounting: lazy(() => import("./tabs/GrantAccounting")),
  clawback: lazy(() => import("./tabs/ClawbackRisk")),
  deadlines: lazy(() => import("./tabs/Deadlines")),
  overlaps: lazy(() => import("./tabs/Overlaps")),
  correspondence: lazy(() => import("./tabs/Correspondence")),
  utilisation: lazy(() => import("./tabs/Utilisation")),
  realisation: lazy(() => import("./tabs/Realisation")),
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

export default function GrantsIncentivesPage() {
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
