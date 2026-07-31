import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "capex_amount", label: "Capex Amount", type: "number" },
  { key: "benefits_realised", label: "Benefits Realised", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["pending", "reviewed", "closed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "capex_amount", label: "Capex", format: "amount" },
  { key: "benefits_realised", label: "Benefits Realised", format: "amount" },
  {
    key: "roi_pct",
    label: "ROI %",
    format: "pct",
    color: (r) => (Number(r.roi_pct) < 0 ? "var(--red)" : Number(r.roi_pct) > 0 ? "var(--green)" : undefined),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Post-Completion Reviews",
    get: (rows) => rows.filter((r) => r.status !== "pending").length,
  },
  {
    label: "Negative ROI",
    get: (rows) => rows.filter((r) => Number(r.roi_pct) < 0).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function CapexRoi() {
  return (
    <CrudTab
      endpoint="/roi"
      title="Log Post-Completion Review"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
