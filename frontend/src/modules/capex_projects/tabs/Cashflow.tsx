import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "period", label: "Period" },
  { key: "planned_amount", label: "Planned Outflow", type: "number" },
  { key: "actual_amount", label: "Actual Outflow", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["on_track", "behind", "ahead"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "period", label: "Period" },
  { key: "planned_amount", label: "Planned", format: "amount" },
  { key: "actual_amount", label: "Actual", format: "amount" },
  {
    key: "variance",
    label: "Variance",
    format: "amount",
    color: (r) => (Number(r.variance) > 0 ? "var(--red)" : Number(r.variance) < 0 ? "var(--green)" : undefined),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Total Planned",
    get: (rows) => rows.reduce((s, r) => s + Number(r.planned_amount ?? 0), 0).toLocaleString(),
  },
  {
    label: "Total Actual",
    get: (rows) => rows.reduce((s, r) => s + Number(r.actual_amount ?? 0), 0).toLocaleString(),
  },
  {
    label: "Behind Plan",
    get: (rows) => rows.filter((r) => r.status === "behind").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function Cashflow() {
  return (
    <CrudTab
      endpoint="/cashflow"
      title="Monitor Project Cash-flow"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
