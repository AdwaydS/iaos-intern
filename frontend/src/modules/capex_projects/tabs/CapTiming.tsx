import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "commissioning_date", label: "Commissioning Date", type: "date" },
  { key: "capitalised_date", label: "Capitalised Date", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["open", "resolved", "closed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "commissioning_date", label: "Commissioned", format: "date" },
  { key: "capitalised_date", label: "Capitalised", format: "date" },
  {
    key: "delay_days",
    label: "Delay (days)",
    color: (r) => (Number(r.delay_days) > 0 ? "var(--red)" : "var(--green)"),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Delayed Capitalisation",
    get: (rows) => rows.filter((r) => Number(r.delay_days) > 0).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Over 90 Days",
    get: (rows) => rows.filter((r) => Number(r.delay_days) > 90).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function CapTiming() {
  return (
    <CrudTab
      endpoint="/cap-timing"
      title="Review Capitalisation Timing"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
