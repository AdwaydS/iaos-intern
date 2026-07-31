import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { qualityBadge, statusBadge, yesNoBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "vendor_name", label: "Vendor Name", required: true },
  { key: "project_name", label: "Project Name", required: true },
  { key: "on_time_delivery", label: "On-Time Delivery", type: "select", options: ["yes", "no"] },
  { key: "quality_rating", label: "Quality Rating", type: "select", options: ["good", "average", "poor"] },
  { key: "issues_count", label: "Issues Count", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["active", "watchlist", "debarred"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "vendor_name", label: "Vendor" },
  { key: "project_name", label: "Project" },
  { key: "on_time_delivery", label: "On-Time", render: (r) => yesNoBadge(r.on_time_delivery) },
  { key: "quality_rating", label: "Quality", render: (r) => qualityBadge(r.quality_rating) },
  { key: "issues_count", label: "Issues" },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Watchlist / Debarred",
    get: (rows) => rows.filter((r) => r.status !== "active").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Late Deliveries",
    get: (rows) => rows.filter((r) => r.on_time_delivery === "no").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total Issues",
    get: (rows) => rows.reduce((s, r) => s + Number(r.issues_count ?? 0), 0),
  },
];

export default function VendorPerf() {
  return (
    <CrudTab
      endpoint="/vendor-perf"
      title="Track Vendor Performance"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
