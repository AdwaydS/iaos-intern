import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import ComplianceRegistryView from "./views/ComplianceRegistryView";
import AnalyticsCalculatorView from "./views/AnalyticsCalculatorView";
import StandardAuditShellView from "./views/StandardAuditShellView";

interface SubPageConfig {
  id: string;
  title: string;
  description: string;
  category: string;
  engine: "registry" | "analytics" | "shell";
  registryType?: "APPLICABILITY" | "LICENCE" | "REGISTERS" | "NOTICES";
  labels?: {
    identifier: string;
    date: string;
    statusOptions: string[];
  };
}

const CATEGORIES = [
  "Command & Control",
  "Applicability & Mapping",
  "Wage & Hour Compliance",
  "Benefits & Welfare",
  "Contractor Auditing",
  "Inspections & Safety",
  "CAAT & Sampling",
  "Audit Execution & CAPA"
];

const SUB_PAGES: SubPageConfig[] = [
  // Category 1: Command & Control
  {
    id: "module_dashboard",
    title: "Module Dashboard & KPIs",
    description: "Live risk scores, exception tallies, applicability coverage percentages, and audit history trends.",
    category: "Command & Control",
    engine: "shell"
  },
  {
    id: "scope_universe",
    title: "Scope & Audit Universe",
    description: "Definition and boundaries of auditable plants, subsidiaries, offices, and process scopes.",
    category: "Command & Control",
    engine: "shell"
  },
  {
    id: "risk_control_matrix",
    title: "Risk & Control Matrix (RCM)",
    description: "Central matrix mapping compliance risks to internal controls, assertions, and process owners.",
    category: "Command & Control",
    engine: "shell"
  },

  // Category 2: Applicability & Mapping
  {
    id: "applicability_mapping",
    title: "Applicability Mapping",
    description: "Checklist mapping specific central and state labour acts (e.g. Factories Act, S&E) applicable per corporate site.",
    category: "Applicability & Mapping",
    engine: "registry",
    registryType: "APPLICABILITY",
    labels: {
      identifier: "Audited Location",
      date: "Mapping Review Date",
      statusOptions: ["Active", "Under Review", "Not Applicable"]
    }
  },
  {
    id: "licence_tracker",
    title: "Licence & Registration",
    description: "Statutory licence tracker ensuring Factories Act, Shops & Establishment, and CLRA certificates are current.",
    category: "Applicability & Mapping",
    engine: "registry",
    registryType: "LICENCE",
    labels: {
      identifier: "Licence Number",
      date: "Expiry Date",
      statusOptions: ["Active", "Pending Renewal", "Expired", "Critical"]
    }
  },
  {
    id: "return_filing",
    title: "Return Filing Tracker",
    description: "Audit ledger checking filing dates and timelines for unified annual returns, PF ECRs, and state returns.",
    category: "Applicability & Mapping",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Filing Form / Type",
      date: "Filing Due Date",
      statusOptions: ["Filed", "Pending", "Overdue"]
    }
  },

  // Category 3: Wage & Hour Compliance
  {
    id: "statutory_register",
    title: "Statutory Register Check",
    description: "Audit checklist tracking compilation status of Form A (Employee Register), Form B (Wage Register), and attendance sheets.",
    category: "Wage & Hour Compliance",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Audited Period",
      date: "Audit Completion Date",
      statusOptions: ["Compliant", "Pending Audit", "Non-compliant"]
    }
  },
  {
    id: "minimum_wages",
    title: "Minimum Wages Compliance",
    description: "Reconciliation tool comparing actual paid payroll rates against notified central and state minimum wages.",
    category: "Wage & Hour Compliance",
    engine: "analytics"
  },
  {
    id: "working_hours_ot",
    title: "Working-Hours & Overtime",
    description: "Audit compliance log assessing daily/weekly shift limits and overtime payment multipliers.",
    category: "Wage & Hour Compliance",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Shift / Department",
      date: "Review Date",
      statusOptions: ["Compliant", "Action Required", "Under Audit"]
    }
  },
  {
    id: "wage_code_readiness",
    title: "Wage-Code Readiness",
    description: "Impact assessment dashboard analyzing compliance with upcoming Code on Wages (e.g. 50% allowance caps).",
    category: "Wage & Hour Compliance",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Impact Category",
      date: "Review Date",
      statusOptions: ["Completed", "Under Review", "Pending"]
    }
  },

  // Category 4: Benefits & Welfare
  {
    id: "pf_esi_coverage",
    title: "PF / ESI Coverage & Deposit",
    description: "Verification of payroll deductions against monthly bank challans and EPFO/ESIC portal deposits.",
    category: "Benefits & Welfare",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Remittance Month",
      date: "Challan Date",
      statusOptions: ["Compliant", "Pending", "Overdue"]
    }
  },
  {
    id: "bonus_gratuity",
    title: "Bonus & Gratuity",
    description: "Compliance reviews under Payment of Bonus Act (Form A/B/C) and Gratuity nomination collections.",
    category: "Benefits & Welfare",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Financial Year",
      date: "Due Date",
      statusOptions: ["Compliant", "Under Review", "Non-compliant"]
    }
  },
  {
    id: "lwf_compliance",
    title: "Labour-Welfare Fund",
    description: "Verification of LWF deductions and half-yearly state welfare board deposits.",
    category: "Benefits & Welfare",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "State Board",
      date: "Remittance Date",
      statusOptions: ["Compliant", "Filed", "Pending"]
    }
  },

  // Category 5: Contractor Auditing
  {
    id: "contract_labour",
    title: "Contract-Labour Compliance",
    description: "Review checklists mapping principal employer responsibilities under CLRA (Form V issues, facility provisions).",
    category: "Contractor Auditing",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Contractor Agency",
      date: "Audit Review Date",
      statusOptions: ["Active", "Issued", "Filed", "Audit Required"]
    }
  },
  {
    id: "contractor_verification",
    title: "Contractor ESIC/PF Verification",
    description: "Verification and upload portal audit reconciliation for subcontractor compliance proofs.",
    category: "Contractor Auditing",
    engine: "analytics"
  },
  {
    id: "contract_worker_master",
    title: "Contract-Worker Master",
    description: "Master list checks evaluating compliance audits (KYC, PF enrollment) for sub-contractor headcounts.",
    category: "Contractor Auditing",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "Location / Section",
      date: "Audit Date",
      statusOptions: ["Compliant", "Action Required", "Pending"]
    }
  },

  // Category 6: Inspections & Safety
  {
    id: "posh_compliance",
    title: "POSH Compliance",
    description: "Trackers monitoring Internal Committee constitutions, training logs, and POSH annual returns.",
    category: "Inspections & Safety",
    engine: "registry",
    registryType: "REGISTERS",
    labels: {
      identifier: "ICC Unit",
      date: "Audit Date",
      statusOptions: ["Compliant", "Audited", "Under Review", "Action Required"]
    }
  },
  {
    id: "inspection_notice",
    title: "Inspection & Notice Log",
    description: "Repository cataloguing regulatory visits by labour inspectors and show-cause replies.",
    category: "Inspections & Safety",
    engine: "registry",
    registryType: "NOTICES",
    labels: {
      identifier: "Notice Ref Number",
      date: "Reply Date",
      statusOptions: ["Resolved", "Under Review", "Action Required", "Critical"]
    }
  },

  // Category 7: CAAT & Sampling
  {
    id: "rule_library",
    title: "Test & Analytics Rule Library",
    description: "Configuration engine for automated red-flag rules, thresholds, and data analytics scripting.",
    category: "CAAT & Sampling",
    engine: "shell"
  },
  {
    id: "data_sources",
    title: "Data Source & Connector Setup",
    description: "Schema mapping tool linking ERP tables, attendance databases, and EPFO portals.",
    category: "CAAT & Sampling",
    engine: "shell"
  },
  {
    id: "sampling_builder",
    title: "Sampling & Population Builder",
    description: "Statistical and risk-based sample drawing tools to pull worker cohorts for detailed fieldwork.",
    category: "CAAT & Sampling",
    engine: "shell"
  },

  // Category 8: Audit Execution & CAPA
  {
    id: "exception_queue",
    title: "Exception & Red-Flag Queue",
    description: "Workflow queue to review, triage, investigate, and close exceptions raised during audits.",
    category: "Audit Execution & CAPA",
    engine: "shell"
  },
  {
    id: "working_papers",
    title: "Working Papers & Evidence",
    description: "Working papers binder where team members log ticks, audit programs, and reviewer sign-offs.",
    category: "Audit Execution & CAPA",
    engine: "shell"
  },
  {
    id: "observation_log",
    title: "Observation & Finding Log",
    description: "Audit findings repository for formal recommendations, grading, and routing to management.",
    category: "Audit Execution & CAPA",
    engine: "shell"
  },
  {
    id: "remediation_tracker",
    title: "Remediation / Action Tracker",
    description: "Remediation engine tracking CAPA action plans, owners, and post-remedial testing results.",
    category: "Audit Execution & CAPA",
    engine: "shell"
  }
];

export default function LabourLawPfEsiPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = searchParams.get("sub") || "module_dashboard";

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");
  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debouncing effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const activePage = SUB_PAGES.find((p) => p.id === activeId) || SUB_PAGES[0];

  const handleSubPageChange = (id: string) => {
    setSearchParams({ sub: id });
  };

  // Filtering sub-pages based on debounced search
  const getFilteredPages = () => {
    if (!debouncedQuery.trim()) return SUB_PAGES;
    return SUB_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  };

  const filteredPages = getFilteredPages();

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 60px)",
        margin: "-16px", // break out of parent padding if any
        background: "var(--canvas)",
      }}
    >
      {/* Subpage Sidebar */}
      <aside
        style={{
          width: 320,
          background: "var(--surface)",
          borderRight: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: "20px 18px 14px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-sm)",
                background: "var(--navy)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="scale" size={18} />
            </div>
            <div>
              <h1 style={{ fontSize: 15, color: "var(--navy)", fontWeight: 700 }}>Compliance Workspace</h1>
              <span style={{ fontSize: 11, color: "var(--slate-soft)", fontWeight: 600 }}>Labour Law & social security</span>
            </div>
          </div>

          {/* Search box */}
          <div style={{ position: "relative" }}>
            <input
              className="input"
              style={{ paddingLeft: 34, fontSize: 13, padding: "8px 10px 8px 34px" }}
              placeholder="Search 25 sub-pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span style={{ position: "absolute", left: 10, top: 9, color: "var(--slate-soft)", fontSize: 12 }}>🔍</span>
          </div>
        </div>

        {/* Scrollable sub-links list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
          {CATEGORIES.map((cat) => {
            const pagesInCat = filteredPages.filter((p) => p.category === cat);
            if (pagesInCat.length === 0) return null;

            return (
              <div key={cat} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--slate)",
                    padding: "0 10px 6px 10px",
                  }}
                >
                  {cat}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {pagesInCat.map((p) => {
                    const isActive = p.id === activePage.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSubPageChange(p.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: "var(--radius-sm)",
                          background: isActive ? "var(--navy-tint)" : "transparent",
                          color: isActive ? "var(--navy)" : "var(--slate)",
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 13.5,
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          width: "100%",
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: isActive ? "var(--gold)" : "transparent",
                            transition: "background 0.15s ease",
                          }}
                        />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </span>
                        {isActive && <span style={{ fontSize: 11 }}>➔</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredPages.length === 0 && (
            <p style={{ textAlign: "center", padding: 24, fontSize: 13, color: "var(--slate-soft)" }}>
              No compliance sub-pages match your search query.
            </p>
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {activePage.engine === "registry" && activePage.registryType && activePage.labels ? (
          <ComplianceRegistryView
            subpage={activePage.id}
            title={activePage.title}
            description={activePage.description}
            registryType={activePage.registryType}
            labels={activePage.labels}
          />
        ) : activePage.engine === "analytics" ? (
          <AnalyticsCalculatorView
            subpage={activePage.id}
            title={activePage.title}
            description={activePage.description}
          />
        ) : (
          <StandardAuditShellView
            subpage={activePage.id}
            title={activePage.title}
            description={activePage.description}
          />
        )}
      </main>
    </div>
  );
}
