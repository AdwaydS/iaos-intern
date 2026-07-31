import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge, yesNoBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "change_desc", label: "Change Description", required: true },
  { key: "scope_impact", label: "Scope Impact" },
  { key: "cost_impact", label: "Cost Impact", type: "number" },
  { key: "approved", label: "Approved", type: "select", options: ["yes", "no"] },
  { key: "status", label: "Status", type: "select", options: ["open", "reviewed", "closed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "change_desc", label: "Change" },
  { key: "scope_impact", label: "Scope Impact" },
  { key: "cost_impact", label: "Cost Impact", format: "amount" },
  { key: "approved", label: "Approved", render: (r) => yesNoBadge(r.approved) },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Unapproved Changes",
    get: (rows) => rows.filter((r) => r.approved === "no").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total Cost Impact",
    get: (rows) => rows.reduce((s, r) => s + Number(r.cost_impact ?? 0), 0).toLocaleString(),
  },
];

export default function ChangeOrder() {
  return (
    <CrudTab
      endpoint="/change-orders"
      title="Log a Change Order"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
