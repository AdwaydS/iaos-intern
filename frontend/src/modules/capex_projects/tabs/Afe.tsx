import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "afe_no", label: "AFE No", required: true },
  { key: "project_name", label: "Project Name", required: true },
  { key: "project_type", label: "Project Type" },
  { key: "approved_afe", label: "Approved AFE", type: "number" },
  { key: "actual_spend", label: "Actual Spend", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["open", "in_progress", "closed", "over_budget"] },
  { key: "approved_date", label: "Approved Date", type: "date" },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "afe_no", label: "AFE No" },
  { key: "project_name", label: "Project" },
  { key: "project_type", label: "Type" },
  { key: "approved_afe", label: "Approved AFE", format: "amount" },
  { key: "actual_spend", label: "Actual Spend", format: "amount" },
  {
    key: "budget_pct",
    label: "Budget %",
    format: "pct",
    color: (r) => (Number(r.budget_pct) > 100 ? "var(--red)" : undefined),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  { label: "Total AFEs", get: (rows) => rows.length },
  {
    label: "Approved Budget",
    get: (rows) => rows.reduce((s, r) => s + Number(r.approved_afe ?? 0), 0).toLocaleString(),
  },
  {
    label: "Actual Spend",
    get: (rows) => rows.reduce((s, r) => s + Number(r.actual_spend ?? 0), 0).toLocaleString(),
  },
  {
    label: "Over Budget",
    get: (rows) => rows.filter((r) => Number(r.budget_pct) > 100).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function Afe() {
  return <CrudTab endpoint="/afes" title="Log an AFE" fields={fields} columns={columns} summaries={summaries} />;
}
