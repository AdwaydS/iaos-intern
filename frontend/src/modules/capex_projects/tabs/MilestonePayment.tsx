import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "milestone", label: "Milestone", required: true },
  { key: "scheduled_amount", label: "Scheduled Amount", type: "number" },
  { key: "paid_amount", label: "Paid Amount", type: "number" },
  { key: "progress_pct", label: "Certified Progress %", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["pending", "part_paid", "paid", "reviewed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "milestone", label: "Milestone" },
  { key: "scheduled_amount", label: "Scheduled", format: "amount" },
  { key: "paid_amount", label: "Paid", format: "amount" },
  {
    key: "progress_pct",
    label: "Progress %",
    format: "pct",
    color: (r) =>
      Number(r.scheduled_amount) > 0 && Number(r.paid_amount) / Number(r.scheduled_amount) > Number(r.progress_pct) / 100 + 0.1
        ? "var(--red)"
        : undefined,
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Payment vs Progress Mismatch",
    get: (rows) =>
      rows.filter(
        (r) =>
          Number(r.scheduled_amount) > 0 &&
          Number(r.paid_amount) / Number(r.scheduled_amount) > Number(r.progress_pct) / 100 + 0.1
      ).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total Scheduled",
    get: (rows) => rows.reduce((s, r) => s + Number(r.scheduled_amount ?? 0), 0).toLocaleString(),
  },
  {
    label: "Total Paid",
    get: (rows) => rows.reduce((s, r) => s + Number(r.paid_amount ?? 0), 0).toLocaleString(),
  },
];

export default function MilestonePayment() {
  return (
    <CrudTab
      endpoint="/milestones"
      title="Log a Milestone Payment"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
