import type { DataTableColumn } from "../components/DataTable";

type Row = Record<string, unknown>;

const currency = (key: string) => ({
  key,
  label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  sortable: true,
  align: "right" as const,
  render: (row: Row) => {
    const v = row[key];
    return typeof v === "number" ? `$${v.toLocaleString()}` : String(v ?? "—");
  },
});

const badge = (key: string, map?: Record<string, string>) => ({
  key,
  label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  sortable: true,
  render: (row: Row) => {
    const val = String(row[key] ?? "");
    const cls = map?.[val] ?? "badge-slate";
    return <span className={`badge ${cls}`}>{val}</span>;
  },
});

const col = (key: string, label?: string, sortable = true) => ({
  key,
  label: label ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  sortable,
});

export const COLUMNS: Record<string, any[]> = {
  budgetVsActual: [
    col("cost_head", "Cost Head"),
    col("department"),
    col("business_unit", "Business Unit"),
    currency("budget"),
    currency("actual"),
    { ...col("variance_pct", "Variance %"), align: "right", render: (r: any) => `${r.variance_pct}%` },
    badge("status", { Favourable: "badge-success", Adverse: "badge-danger" }),
  ],
  preApproval: [
    col("cost_center", "Cost Center"),
    col("department"),
    col("owner"),
    col("approval_date", "Approval Date"),
    col("period_start", "Period Start"),
    { ...col("days_before", "Days Before"), align: "right" },
    { ...col("pct_approved", "% Approved"), align: "right", render: (r: any) => `${r.pct_approved}%` },
    badge("status", { Compliant: "badge-success", "Non-Compliant": "badge-danger", Missing: "badge-gold" }),
  ],
  chronicOverspend: [
    col("cost_center", "Cost Center"),
    col("cost_head", "Cost Head"),
    { ...col("periods_exceeded", "Periods Exceeded"), align: "right" },
    { ...col("avg_overspend_pct", "Avg Overspend %"), align: "right", render: (r: any) => `${r.avg_overspend_pct}%` },
    currency("total_variance"),
    badge("risk", { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium" }),
  ],
  rebudget: [
    col("revision_id", "Revision ID"),
    col("cost_center", "Cost Center"),
    currency("original_budget"),
    currency("revised_budget"),
    { ...col("change_pct", "Change %"), align: "right", render: (r: any) => `${r.change_pct}%` },
    col("approver"),
    col("approval_date", "Approval Date"),
    col("reason"),
    badge("status", { Approved: "badge-success", Pending: "badge-gold" }),
  ],
  assumption: [
    col("assumption_id", "Assumption ID"),
    col("category"),
    col("budget_assumption", "Budget Assumption"),
    col("historical_avg", "Historical Avg"),
    col("benchmark"),
    col("variance"),
    badge("reasonableness", { Reasonable: "badge-success", Questionable: "badge-gold", Aggressive: "badge-danger" }),
  ],
  flashFinal: [
    col("period"),
    col("cost_center", "Cost Center"),
    currency("flash_variance"),
    currency("final_variance"),
    currency("late_adjustment"),
    { ...col("adjustment_pct", "Adj. %"), align: "right", render: (r: any) => `${r.adjustment_pct}%` },
  ],
  rollingForecast: [
    col("department"),
    col("last_update", "Last Update"),
    { ...col("forecast_accuracy", "Accuracy %"), align: "right", render: (r: any) => `${r.forecast_accuracy}%` },
    col("update_cadence", "Cadence"),
    { ...col("variance_to_actual", "Variance %"), align: "right", render: (r: any) => `${r.variance_to_actual}%` },
    badge("status", { "On Track": "badge-success", "At Risk": "badge-gold", Overdue: "badge-danger" }),
  ],
  zbb: [
    col("package_id", "Package ID"),
    col("department"),
    col("activity"),
    { ...col("justification_score", "Score"), align: "right" },
    { ...col("rank"), align: "right" },
    currency("requested"),
    currency("approved"),
    badge("status", { Approved: "badge-success", Reduced: "badge-gold" }),
  ],
  capex: [
    col("project_id", "Project ID"),
    col("project_name", "Project Name"),
    currency("approved_budget"),
    currency("committed"),
    currency("spent"),
    { ...col("utilisation_pct", "Utilisation %"), align: "right", render: (r: any) => `${r.utilisation_pct}%` },
    { ...col("slippage_months", "Slippage (mo)"), align: "right" },
    badge("status", { "In Progress": "badge-gold", "On Track": "badge-success", Delayed: "badge-danger" }),
  ],
  scorecard: [
    col("department"),
    { ...col("budget_accuracy", "Budget Acc."), align: "right" },
    { ...col("forecast_accuracy", "Forecast Acc."), align: "right" },
    { ...col("compliance_score", "Compliance"), align: "right" },
    { ...col("variance_mgmt", "Variance Mgmt"), align: "right" },
    { ...col("composite_score", "Composite"), align: "right" },
    badge("rating", { A: "badge-success", B: "badge-gold", C: "badge-danger" }),
  ],
  unspent: [
    col("cost_center", "Cost Center"),
    col("department"),
    currency("parked_amount"),
    { ...col("q1_release_pct", "Q1 %"), align: "right", render: (r: any) => `${r.q1_release_pct}%` },
    { ...col("q2_release_pct", "Q2 %"), align: "right", render: (r: any) => `${r.q2_release_pct}%` },
    { ...col("q3_release_pct", "Q3 %"), align: "right", render: (r: any) => `${r.q3_release_pct}%` },
    { ...col("q4_dec_release_pct", "Q4 Dec %"), align: "right", render: (r: any) => `${r.q4_dec_release_pct}%` },
    badge("flag", { "Year-End Spike": "badge-danger", Normal: "badge-success" }),
  ],
  costDriver: [
    col("driver"),
    { ...col("budget_index", "Budget Index"), align: "right" },
    { ...col("actual_index", "Actual Index"), align: "right" },
    { ...col("variance_pct", "Variance %"), align: "right", render: (r: any) => `${r.variance_pct}%` },
    currency("impact_amount"),
    badge("direction", { Favourable: "badge-success", Unfavourable: "badge-danger" }),
  ],
  contingency: [
    col("reserve_id", "Reserve ID"),
    col("type"),
    currency("original_allocation"),
    currency("drawn_amount"),
    currency("remaining"),
    { ...col("drawdown_pct", "Drawdown %"), align: "right", render: (r: any) => `${r.drawdown_pct}%` },
    col("last_draw_date", "Last Draw"),
    col("approver"),
    badge("status", { "Within Policy": "badge-success", "Near Limit": "badge-gold", Breached: "badge-danger" }),
  ],
  forecastBias: [
    col("period"),
    currency("forecast"),
    currency("actual"),
    { ...col("bias_pct", "Bias %"), align: "right", render: (r: any) => `${r.bias_pct}%` },
    badge("direction", { "Under-forecast": "badge-danger", "Over-forecast": "badge-success" }),
  ],
  approvalTrail: [
    col("event_id", "Event ID"),
    col("timestamp"),
    col("actor"),
    col("action"),
    col("entity"),
    col("workflow_step", "Workflow Step"),
    col("ip_address", "IP Address"),
  ],
  scope: [
    col("entity_id", "Entity ID"),
    col("entity_name", "Entity Name"),
    { ...col("in_scope", "In Scope"), render: (r: any) => r.in_scope ? "Yes" : "No" },
    currency("materiality_threshold"),
    col("last_audit", "Last Audit"),
    col("risk_rating", "Risk Rating"),
    { ...col("coverage_pct", "Coverage %"), align: "right", render: (r: any) => `${r.coverage_pct}%` },
  ],
  rules: [
    col("rule_id", "Rule ID"),
    col("name"),
    col("category"),
    col("frequency"),
    col("last_run", "Last Run"),
    { ...col("hits"), align: "right" },
    badge("status", { Active: "badge-success" }),
  ],
  dataSources: [
    col("connector_id", "Connector ID"),
    col("name"),
    col("type"),
    badge("status", { Connected: "badge-success", Degraded: "badge-gold" }),
    col("last_sync", "Last Sync"),
    { ...col("records_synced", "Records"), align: "right", render: (r: any) => Number(r.records_synced).toLocaleString() },
    badge("health", { Healthy: "badge-success", Warning: "badge-gold" }),
  ],
  sampling: [
    col("sample_id", "Sample ID"),
    col("population"),
    { ...col("population_size", "Population"), align: "right" },
    { ...col("sample_size", "Sample Size"), align: "right" },
    col("method"),
    col("confidence"),
    col("created_by", "Created By"),
    badge("status", { Complete: "badge-success", "In Progress": "badge-gold" }),
  ],
  findings: [
    col("finding_id", "Finding ID"),
    col("title"),
    badge("severity", { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium" }),
    col("department"),
    col("observation_date", "Date"),
    badge("status", { Open: "badge-open", "In Review": "badge-in-review", Draft: "badge-pending" }),
    col("owner"),
  ],
  actions: [
    col("action_id", "Action ID"),
    col("finding_ref", "Finding Ref"),
    col("description"),
    col("owner"),
    col("due_date", "Due Date"),
    badge("status", { Open: "badge-open", "In Progress": "badge-in-review" }),
    { ...col("completion_pct", "Completion %"), align: "right", render: (r: any) => `${r.completion_pct}%` },
  ],
  rcm: [
    col("risk_id", "Risk ID"),
    badge("financial_assertion", { Accuracy: "badge-slate", Occurrence: "badge-slate", Completeness: "badge-slate" }),
    col("control_description", "Control Description"),
    col("control_owner", "Control Owner"),
    badge("control_type", { Automated: "badge-success", Manual: "badge-gold" }),
    badge("risk_grade", { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-success" }),
    currency("associated_financials"),
  ],
  exceptions: [
    col("cost_center", "Cost Center"),
    col("budget_owner", "Owner"),
    col("source_procedure", "Procedure"),
    currency("variance_amount"),
    badge("risk_grade", { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium" }),
    badge("status", { Open: "badge-open", "In Review": "badge-in-review", Resolved: "badge-resolved" }),
  ],
  workingPapers: [
    col("attachment_name", "Attachment Name"),
    col("associated_procedure_id", "Procedure ID"),
    col("upload_date", "Upload Date"),
    col("uploaded_by", "Uploaded By"),
    badge("review_status", { Pending: "badge-pending", Reviewed: "badge-reviewed", "Signed Off": "badge-signed-off" }),
    badge("risk_grade", { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-success" }),
    currency("financial_impact"),
    {
      key: "audit_tickmarks",
      label: "Tickmarks",
      render: (r: Row) => {
        const list = (r.audit_tickmarks as string[]) || [];
        return (
          <div className="bgt-wp-tickmarks" style={{ display: "flex", gap: "4px" }}>
            {list.map((t, i) => (
              <span key={i} className="bgt-wp-tick active" style={{ display: "inline-block", background: "var(--navy)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>{t}</span>
            ))}
          </div>
        );
      }
    },
  ],
};
