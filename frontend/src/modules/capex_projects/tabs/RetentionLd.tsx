import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "contractor", label: "Contractor" },
  { key: "retention_amount", label: "Retention Amount", type: "number" },
  { key: "retention_release_date", label: "Retention Release Date", type: "date" },
  { key: "ld_amount", label: "Liquidated Damages", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["held", "part_released", "released"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "contractor", label: "Contractor" },
  { key: "retention_amount", label: "Retention", format: "amount" },
  { key: "retention_release_date", label: "Release Date", format: "date" },
  {
    key: "ld_amount",
    label: "LD",
    format: "amount",
    color: (r) => (Number(r.ld_amount) > 0 ? "var(--red)" : undefined),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Retention Held",
    get: (rows) =>
      rows
        .filter((r) => r.status === "held")
        .reduce((s, r) => s + Number(r.retention_amount ?? 0), 0)
        .toLocaleString(),
  },
  {
    label: "Total LD Applied",
    get: (rows) => rows.reduce((s, r) => s + Number(r.ld_amount ?? 0), 0).toLocaleString(),
    color: (v) => (Number(String(v).replace(/,/g, "")) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function RetentionLd() {
  return (
    <CrudTab
      endpoint="/retention-ld"
      title="Manage Retention & LD"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
