import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "milestone", label: "Milestone" },
  { key: "planned_date", label: "Planned Date", type: "date" },
  { key: "actual_date", label: "Actual / Latest Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["open", "recovered", "closed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "milestone", label: "Milestone" },
  { key: "planned_date", label: "Planned", format: "date" },
  { key: "actual_date", label: "Actual", format: "date" },
  {
    key: "delay_days",
    label: "Delay (days)",
    color: (r) => (Number(r.delay_days) > 0 ? "var(--red)" : "var(--green)"),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Delays Flagged",
    get: (rows) => rows.filter((r) => Number(r.delay_days) > 0).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Max Delay (days)",
    get: (rows) => rows.reduce((m, r) => Math.max(m, Number(r.delay_days ?? 0)), 0),
    color: (v) => (Number(v) > 60 ? "var(--red)" : undefined),
  },
  {
    label: "Delays > 60 days",
    get: (rows) => rows.filter((r) => Number(r.delay_days) > 60).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function ScheduleOverrun() {
  return (
    <CrudTab
      endpoint="/schedule-overruns"
      title="Log a Schedule Delay"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
