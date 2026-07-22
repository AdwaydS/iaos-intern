import { useEffect, useState } from "react";
import { del, get, post } from "../../lib/api";

const SLUG = "business_continuity_dr";

const STATUS_OPTIONS = ["Open", "Pass", "Fail", "Partial", "NA"] as const;

interface DashboardSummary {
  risk_score: number;
  open_exceptions: number;
  coverage_pct: number;
  trend: string;
  signature_total: number;
  signature_pass: number;
  signature_fail: number;
  signature_open: number;
}

type FieldType = "text" | "textarea" | "date" | "number" | "select" | "checkbox";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
}

interface ColumnDef {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface SectionDef {
  id: number;
  key: string;
  title: string;
  subtitle: string;
  kind: "signature" | "shell";
  endpoint: string;
  fields: FieldDef[];
  columns: ColumnDef[];
}

function statusBadge(status: unknown) {
  const s = String(status ?? "Open");
  const cls =
    s === "Pass" || s === "NA"
      ? "badge-success"
      : s === "Fail"
        ? "badge-danger"
        : s === "Partial"
          ? "badge-gold"
          : "badge";
  return <span className={`badge ${cls}`}>{s}</span>;
}

function boolCell(value: unknown) {
  if (value === true) return <span className="badge badge-success">Yes</span>;
  if (value === false) return <span className="badge badge-danger">No</span>;
  return "—";
}

const SECTIONS: SectionDef[] = [
  {
    id: 1,
    key: "bia",
    title: "Business-Impact Analysis",
    subtitle: "Critical-process identification",
    kind: "signature",
    endpoint: "bia",
    fields: [
      { key: "critical_processes", label: "Critical processes", type: "textarea", required: true },
      { key: "owner", label: "Owner", type: "text" },
      { key: "due_date", label: "Due date", type: "date" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "evidence_url", label: "Evidence URL", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "critical_processes", label: "Critical processes" },
      { key: "owner", label: "Owner" },
      { key: "due_date", label: "Due" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 2,
    key: "bcp-plans",
    title: "BCP Plan Currency",
    subtitle: "Plans updated and owned",
    kind: "signature",
    endpoint: "bcp-plans",
    fields: [
      { key: "plan_version", label: "Plan version", type: "text", required: true },
      { key: "last_reviewed", label: "Last reviewed", type: "date" },
      { key: "owner", label: "Owner", type: "text" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "evidence_url", label: "Evidence URL", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "plan_version", label: "Version" },
      { key: "last_reviewed", label: "Last reviewed" },
      { key: "owner", label: "Owner" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 3,
    key: "dr-tests",
    title: "DR Test Evidence",
    subtitle: "Periodic disaster-recovery drills",
    kind: "signature",
    endpoint: "dr-tests",
    fields: [
      { key: "test_type", label: "Test type", type: "text", required: true },
      { key: "test_date", label: "Test date", type: "date" },
      { key: "result", label: "Result", type: "text" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "evidence_url", label: "Evidence URL", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "test_type", label: "Type" },
      { key: "test_date", label: "Date" },
      { key: "result", label: "Result" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 4,
    key: "rto-rpo",
    title: "RTO / RPO Adherence",
    subtitle: "Recovery objectives met",
    kind: "signature",
    endpoint: "rto-rpo",
    fields: [
      { key: "process", label: "Process", type: "text", required: true },
      { key: "rto_target", label: "RTO target", type: "text" },
      { key: "rpo_target", label: "RPO target", type: "text" },
      { key: "rto_actual", label: "RTO actual", type: "text" },
      { key: "rpo_actual", label: "RPO actual", type: "text" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "process", label: "Process" },
      { key: "rto_target", label: "RTO target" },
      { key: "rpo_target", label: "RPO target" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 5,
    key: "backup-tests",
    title: "Backup Restoration Testing",
    subtitle: "Restorability verification",
    kind: "signature",
    endpoint: "backup-tests",
    fields: [
      { key: "system", label: "System", type: "text", required: true },
      { key: "last_test_date", label: "Last test date", type: "date" },
      { key: "result", label: "Result", type: "text" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "evidence_url", label: "Evidence URL", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "system", label: "System" },
      { key: "last_test_date", label: "Last test" },
      { key: "result", label: "Result" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 6,
    key: "alt-sites",
    title: "Alternate-Site Readiness",
    subtitle: "Failover-site capability",
    kind: "signature",
    endpoint: "alt-sites",
    fields: [
      { key: "site_name", label: "Site name", type: "text", required: true },
      { key: "site_type", label: "Site type", type: "select", options: ["Hot", "Warm", "Cold"] },
      { key: "last_drill", label: "Last drill", type: "date" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "site_name", label: "Site" },
      { key: "site_type", label: "Type" },
      { key: "last_drill", label: "Last drill" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 7,
    key: "crisis-gov",
    title: "Crisis-Management Governance",
    subtitle: "Escalation and command",
    kind: "signature",
    endpoint: "crisis-gov",
    fields: [
      { key: "cmt_name", label: "CMT name", type: "text", required: true },
      { key: "last_drill", label: "Last drill", type: "date" },
      { key: "escalation_chain", label: "Escalation chain", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "cmt_name", label: "CMT" },
      { key: "last_drill", label: "Last drill" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 8,
    key: "spof",
    title: "Single-Point-of-Failure Map",
    subtitle: "Critical dependency risks",
    kind: "signature",
    endpoint: "spof",
    fields: [
      { key: "dependency", label: "Dependency", type: "text", required: true },
      { key: "risk_level", label: "Risk level", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "mitigation", label: "Mitigation", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "dependency", label: "Dependency" },
      { key: "risk_level", label: "Risk" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 9,
    key: "vendor-cont",
    title: "Vendor / Supply Continuity",
    subtitle: "Third-party resilience",
    kind: "signature",
    endpoint: "vendor-cont",
    fields: [
      { key: "vendor", label: "Vendor", type: "text", required: true },
      { key: "criticality", label: "Criticality", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "bcp_confirmed", label: "BCP confirmed", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "vendor", label: "Vendor" },
      { key: "criticality", label: "Criticality" },
      { key: "bcp_confirmed", label: "BCP confirmed", render: boolCell },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 10,
    key: "call-trees",
    title: "Communication & Call-Tree",
    subtitle: "Emergency contact readiness",
    kind: "signature",
    endpoint: "call-trees",
    fields: [
      { key: "contact_count", label: "Contact count", type: "number" },
      { key: "last_test_date", label: "Last test date", type: "date" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "contact_count", label: "Contacts" },
      { key: "last_test_date", label: "Last test" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 11,
    key: "dc-resilience",
    title: "Data-Centre Resilience",
    subtitle: "Power/cooling/redundancy",
    kind: "signature",
    endpoint: "dc-resilience",
    fields: [
      { key: "dc_name", label: "Data centre", type: "text", required: true },
      { key: "has_redundant_power", label: "Redundant power", type: "checkbox" },
      { key: "has_redundant_cooling", label: "Redundant cooling", type: "checkbox" },
      { key: "has_redundant_network", label: "Redundant network", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "dc_name", label: "DC" },
      { key: "has_redundant_power", label: "Power", render: boolCell },
      { key: "has_redundant_cooling", label: "Cooling", render: boolCell },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 12,
    key: "pandemic",
    title: "Pandemic / Remote-Work Plan",
    subtitle: "Workforce continuity",
    kind: "signature",
    endpoint: "pandemic",
    fields: [
      { key: "plan_version", label: "Plan version", type: "text", required: true },
      { key: "remote_work_capable", label: "Remote-work capable", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "plan_version", label: "Version" },
      { key: "remote_work_capable", label: "Remote capable", render: boolCell },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 13,
    key: "insurance",
    title: "Insurance-BCP Alignment",
    subtitle: "BI cover vs continuity risk",
    kind: "signature",
    endpoint: "insurance",
    fields: [
      { key: "policy_ref", label: "Policy reference", type: "text", required: true },
      { key: "bi_cover_amount", label: "BI cover amount", type: "text" },
      { key: "review_date", label: "Review date", type: "date" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "policy_ref", label: "Policy" },
      { key: "bi_cover_amount", label: "BI cover" },
      { key: "review_date", label: "Review" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 14,
    key: "cost-est",
    title: "Recovery-Cost Estimation",
    subtitle: "Cost of downtime modelling",
    kind: "signature",
    endpoint: "cost-est",
    fields: [
      { key: "scenario", label: "Scenario", type: "text", required: true },
      { key: "estimated_downtime_cost", label: "Downtime cost", type: "text" },
      { key: "recovery_budget", label: "Recovery budget", type: "text" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "scenario", label: "Scenario" },
      { key: "estimated_downtime_cost", label: "Downtime cost" },
      { key: "recovery_budget", label: "Budget" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 15,
    key: "post-incident",
    title: "Post-Incident Review",
    subtitle: "Lessons-learned tracking",
    kind: "signature",
    endpoint: "post-incident",
    fields: [
      { key: "incident_date", label: "Incident date", type: "date" },
      { key: "lessons_learned", label: "Lessons learned", type: "textarea" },
      { key: "action_items", label: "Action items", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: [...STATUS_OPTIONS] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "incident_date", label: "Date" },
      { key: "lessons_learned", label: "Lessons" },
      { key: "status", label: "Status", render: statusBadge },
    ],
  },
  {
    id: 16,
    key: "dashboard-kpis",
    title: "Module Dashboard & KPIs",
    subtitle: "Live risk score, open exceptions, coverage % and trend",
    kind: "shell",
    endpoint: "dashboard-kpis",
    fields: [
      { key: "risk_score", label: "Risk score (0–100)", type: "number" },
      { key: "open_exceptions", label: "Open exceptions", type: "number" },
      { key: "coverage_pct", label: "Coverage %", type: "number" },
      { key: "trend", label: "Trend", type: "select", options: ["Improving", "Stable", "Worsening"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "risk_score", label: "Risk score" },
      { key: "open_exceptions", label: "Exceptions" },
      { key: "coverage_pct", label: "Coverage %" },
      { key: "trend", label: "Trend" },
    ],
  },
  {
    id: 17,
    key: "scope",
    title: "Scope & Audit Universe",
    subtitle: "Define auditable units/entities/processes in scope",
    kind: "shell",
    endpoint: "scope",
    fields: [
      { key: "entity", label: "Entity", type: "text", required: true },
      { key: "process", label: "Process", type: "text" },
      { key: "in_scope", label: "In scope", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "entity", label: "Entity" },
      { key: "process", label: "Process" },
      { key: "in_scope", label: "In scope", render: boolCell },
    ],
  },
  {
    id: 18,
    key: "rcm",
    title: "Risk & Control Matrix (RCM)",
    subtitle: "Catalogue risks, controls, assertions and owners",
    kind: "shell",
    endpoint: "rcm",
    fields: [
      { key: "risk_description", label: "Risk", type: "textarea", required: true },
      { key: "control_description", label: "Control", type: "textarea" },
      { key: "assertion", label: "Assertion", type: "text" },
      { key: "control_owner", label: "Control owner", type: "text" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "risk_description", label: "Risk" },
      { key: "control_description", label: "Control" },
      { key: "control_owner", label: "Owner" },
    ],
  },
  {
    id: 19,
    key: "rules",
    title: "Test & Analytics Rule Library",
    subtitle: "Automated red-flag rules, thresholds and CAAT scripts",
    kind: "shell",
    endpoint: "rules",
    fields: [
      { key: "rule_name", label: "Rule name", type: "text", required: true },
      { key: "threshold", label: "Threshold", type: "text" },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "is_active", label: "Active", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "rule_name", label: "Rule" },
      { key: "threshold", label: "Threshold" },
      { key: "severity", label: "Severity" },
      { key: "is_active", label: "Active", render: boolCell },
    ],
  },
  {
    id: 20,
    key: "data-sources",
    title: "Data Source & Connector Setup",
    subtitle: "Map ERP tables/APIs/uploads feeding analytics",
    kind: "shell",
    endpoint: "data-sources",
    fields: [
      { key: "source_name", label: "Source name", type: "text", required: true },
      { key: "source_type", label: "Source type", type: "select", options: ["ERP", "API", "Upload", "Database"] },
      { key: "connection_status", label: "Status", type: "select", options: ["Pending", "Connected", "Failed"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "source_name", label: "Source" },
      { key: "source_type", label: "Type" },
      { key: "connection_status", label: "Status" },
    ],
  },
  {
    id: 21,
    key: "sampling",
    title: "Sampling & Population Builder",
    subtitle: "Draw statistical or judgemental samples",
    kind: "shell",
    endpoint: "sampling",
    fields: [
      { key: "population_name", label: "Population", type: "text", required: true },
      { key: "total_records", label: "Total records", type: "number" },
      { key: "sample_size", label: "Sample size", type: "number" },
      { key: "method", label: "Method", type: "select", options: ["Statistical", "Judgemental", "100%"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "population_name", label: "Population" },
      { key: "total_records", label: "Total" },
      { key: "sample_size", label: "Sample" },
      { key: "method", label: "Method" },
    ],
  },
  {
    id: 22,
    key: "exceptions",
    title: "Exception & Red-Flag Queue",
    subtitle: "Triage system-generated exceptions",
    kind: "shell",
    endpoint: "exceptions",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
      { key: "disposition", label: "Disposition", type: "select", options: ["Open", "Accepted", "Remediated", "False positive"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Exception" },
      { key: "severity", label: "Severity" },
      { key: "disposition", label: "Disposition" },
    ],
  },
  {
    id: 23,
    key: "working-papers",
    title: "Working Papers & Evidence",
    subtitle: "Attach evidence, tick-marks and reviewer sign-off",
    kind: "shell",
    endpoint: "working-papers",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "evidence_url", label: "Evidence URL", type: "text" },
      { key: "reviewer", label: "Reviewer", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "In review", "Signed off"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Paper" },
      { key: "reviewer", label: "Reviewer" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: 24,
    key: "findings",
    title: "Observation & Finding Log",
    subtitle: "Raise, grade and route findings",
    kind: "shell",
    endpoint: "findings",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "grade", label: "Grade", type: "select", options: ["Observation", "Low", "Medium", "High", "Critical"] },
      { key: "status", label: "Status", type: "select", options: ["Open", "In progress", "Closed"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "title", label: "Finding" },
      { key: "grade", label: "Grade" },
      { key: "status", label: "Status" },
    ],
  },
  {
    id: 25,
    key: "remediation",
    title: "Remediation / Action Tracker",
    subtitle: "Track CAPA items, owners, due dates and re-testing",
    kind: "shell",
    endpoint: "remediation",
    fields: [
      { key: "action", label: "Action", type: "textarea", required: true },
      { key: "owner", label: "Owner", type: "text" },
      { key: "due_date", label: "Due date", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Open", "In progress", "Closed", "Overdue"] },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    columns: [
      { key: "action", label: "Action" },
      { key: "owner", label: "Owner" },
      { key: "due_date", label: "Due" },
      { key: "status", label: "Status" },
    ],
  },
];

function emptyForm(fields: FieldDef[]): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "checkbox") form[f.key] = false;
    else if (f.type === "number") form[f.key] = 0;
    else if (f.type === "select" && f.options?.length) form[f.key] = f.options[0];
    else form[f.key] = "";
  }
  return form;
}

function trendBadge(trend: string) {
  const cls =
    trend === "Improving" ? "badge-success" : trend === "Worsening" ? "badge-danger" : "badge-gold";
  return <span className={`badge ${cls}`}>{trend}</span>;
}

function DashboardCards({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 14,
        marginBottom: 20,
      }}
    >
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Risk score</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "var(--navy)" }}>{summary.risk_score}</div>
      </div>
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Open exceptions</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "var(--navy)" }}>{summary.open_exceptions}</div>
      </div>
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Coverage</div>
        <div style={{ fontSize: 28, fontWeight: 600, color: "var(--navy)" }}>{summary.coverage_pct}%</div>
      </div>
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Trend</div>
        <div style={{ marginTop: 6 }}>{trendBadge(summary.trend)}</div>
      </div>
      <div className="card" style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 12, color: "var(--slate)", marginBottom: 4 }}>Signature checkpoints</div>
        <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 4 }}>
          {summary.signature_pass} pass · {summary.signature_fail} fail · {summary.signature_open} open
        </div>
      </div>
    </div>
  );
}

function SectionPanel({
  section,
  onMutate,
}: {
  section: SectionDef;
  onMutate: () => void;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(section.fields));
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const data = await get<Record<string, unknown>[]>(`/api/modules/${SLUG}/${section.endpoint}`);
    setRows(data);
    setLoading(false);
  }

  useEffect(() => {
    setForm(emptyForm(section.fields));
    refresh();
  }, [section.key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    for (const field of section.fields) {
      if (!field.required) continue;
      const value = form[field.key];
      if (field.type === "checkbox") continue;
      if (value === "" || value === null || value === undefined) return;
    }
    const payload: Record<string, unknown> = { ...form };
    for (const field of section.fields) {
      if (field.type === "date" && payload[field.key] === "") payload[field.key] = null;
      if (field.type === "checkbox" && payload[field.key] === false) payload[field.key] = false;
    }
    await post(`/api/modules/${SLUG}/${section.endpoint}`, payload);
    setForm(emptyForm(section.fields));
    await refresh();
    onMutate();
  }

  function renderField(field: FieldDef) {
    const value = form[field.key];
    if (field.type === "textarea") {
      return (
        <textarea
          className="input"
          style={{ minHeight: 72, resize: "vertical" }}
          value={String(value ?? "")}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
        />
      );
    }
    if (field.type === "select") {
      return (
        <select
          className="select"
          value={String(value ?? "")}
          onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
        >
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    if (field.type === "checkbox") {
      return (
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.checked })}
          />
          <span style={{ fontSize: 14 }}>Yes</span>
        </label>
      );
    }
    return (
      <input
        className="input"
        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
        value={field.type === "number" ? Number(value ?? 0) : String(value ?? "")}
        onChange={(e) =>
          setForm({
            ...form,
            [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
          })
        }
        required={field.required}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1.5fr 1fr" }}>
      <div className="card" style={{ overflow: "hidden", height: "fit-content" }}>
        {loading ? (
          <p style={{ padding: 18 }}>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                {section.columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  {section.columns.map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? "—")}
                    </td>
                  ))}
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 12px" }}
                      onClick={async () => {
                        await del(`/api/modules/${SLUG}/${section.endpoint}/${row.id}`);
                        await refresh();
                        onMutate();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={section.columns.length + 1} style={{ color: "var(--slate)" }}>
                    No records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <form className="card" style={{ padding: 22 }} onSubmit={submit}>
        <h3 style={{ color: "var(--navy)", marginBottom: 4 }}>Add record</h3>
        <p style={{ fontSize: 13, color: "var(--slate)", marginBottom: 14 }}>{section.subtitle}</p>
        {section.fields.map((field) => (
          <div className="field" key={field.key}>
            <label>{field.label}</label>
            {renderField(field)}
          </div>
        ))}
        <button className="btn btn-primary btn-block">Save</button>
      </form>
    </div>
  );
}

export default function BusinessContinuityDrPage() {
  const [activeKey, setActiveKey] = useState(SECTIONS[0].key);
  const [group, setGroup] = useState<"signature" | "shell">("signature");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const activeSection = SECTIONS.find((s) => s.key === activeKey) ?? SECTIONS[0];
  const visibleSections = SECTIONS.filter((s) => s.kind === group);

  async function loadSummary() {
    setSummary(await get<DashboardSummary>(`/api/modules/${SLUG}/dashboard/summary`));
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div>
      <DashboardCards summary={summary} />

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          className={`btn ${group === "signature" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setGroup("signature");
            setActiveKey(SECTIONS.find((s) => s.kind === "signature")!.key);
          }}
        >
          Signature (1–15)
        </button>
        <button
          className={`btn ${group === "shell" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => {
            setGroup("shell");
            setActiveKey(SECTIONS.find((s) => s.kind === "shell")!.key);
          }}
        >
          Shell (16–25)
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: "10px 12px",
          marginBottom: 16,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          maxHeight: 120,
          overflowY: "auto",
        }}
      >
        {visibleSections.map((s) => (
          <button
            key={s.key}
            className={`btn ${activeKey === s.key ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "6px 10px", fontSize: 13 }}
            onClick={() => setActiveKey(s.key)}
            title={s.subtitle}
          >
            {s.id}. {s.title}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>
          {activeSection.id}. {activeSection.title}
        </h2>
        <p style={{ color: "var(--slate)", fontSize: 14 }}>{activeSection.subtitle}</p>
      </div>

      <SectionPanel section={activeSection} onMutate={loadSummary} />
    </div>
  );
}
