import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "afe_no", label: "AFE No" },
  { key: "sanctioned_cost", label: "Sanctioned Cost", type: "number" },
  { key: "actual_cost", label: "Actual Cost", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["open", "reviewed", "closed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "afe_no", label: "AFE No" },
  { key: "sanctioned_cost", label: "Sanctioned", format: "amount" },
  { key: "actual_cost", label: "Actual", format: "amount" },
  {
    key: "overrun_amount",
    label: "Overrun",
    format: "amount",
    color: (r) => (Number(r.overrun_amount) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    key: "overrun_pct",
    label: "Overrun %",
    format: "pct",
    color: (r) => (Number(r.overrun_pct) > 10 ? "var(--red)" : undefined),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Open Overruns",
    get: (rows) => rows.filter((r) => r.status === "open" && Number(r.overrun_amount) > 0).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total Overrun",
    get: (rows) =>
      rows
        .reduce((s, r) => s + Math.max(0, Number(r.overrun_amount ?? 0)), 0)
        .toLocaleString(),
    color: (v) => (Number(String(v).replace(/,/g, "")) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Overrun > 10%",
    get: (rows) => rows.filter((r) => Number(r.overrun_pct) > 10).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function CostOverrun() {
  return (
    <CrudTab
      endpoint="/cost-overruns"
      title="Track a Cost Overrun"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
