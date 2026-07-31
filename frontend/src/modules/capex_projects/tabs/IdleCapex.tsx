import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "capex_amount", label: "Capex Amount", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["idle", "abandoned", "restarted"] },
  { key: "last_activity_date", label: "Last Activity Date", type: "date" },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "capex_amount", label: "Capex Amount", format: "amount" },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <span className={`badge ${r.status === "abandoned" ? "badge-danger" : r.status === "idle" ? "badge-gold" : "badge-success"}`}>
        {String(r.status)}
      </span>
    ),
  },
  { key: "last_activity_date", label: "Last Activity", format: "date" },
  {
    key: "idle_days",
    label: "Idle Days",
    color: (r) => (Number(r.idle_days) > 180 ? "var(--red)" : undefined),
  },
];

const summaries: SummaryDef[] = [
  {
    label: "Idle Projects",
    get: (rows) => rows.filter((r) => r.status === "idle").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Abandoned",
    get: (rows) => rows.filter((r) => r.status === "abandoned").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Stuck Capital (₹)",
    get: (rows) => rows.filter((r) => r.status !== "restarted").reduce((s, r) => s + Number(r.capex_amount ?? 0), 0).toLocaleString(),
    color: (v) => (Number(String(v).replace(/,/g, "")) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function IdleCapex() {
  return (
    <CrudTab
      endpoint="/idle-capex"
      title="Flag Idle / Abandoned Capex"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
