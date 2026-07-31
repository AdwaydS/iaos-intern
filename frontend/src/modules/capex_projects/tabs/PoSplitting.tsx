import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { yesNoBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "vendor", label: "Vendor" },
  { key: "po_count", label: "PO Count", type: "number" },
  { key: "po_total", label: "PO Total", type: "number" },
  { key: "approval_threshold", label: "Approval Threshold", type: "number" },
  { key: "flagged", label: "Flagged", type: "select", options: ["yes", "no"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "vendor", label: "Vendor" },
  { key: "po_count", label: "POs" },
  { key: "po_total", label: "PO Total", format: "amount" },
  { key: "approval_threshold", label: "Threshold", format: "amount" },
  { key: "flagged", label: "Flagged", render: (r) => yesNoBadge(r.flagged) },
];

const summaries: SummaryDef[] = [
  {
    label: "Flagged Splits",
    get: (rows) => rows.filter((r) => r.flagged === "yes").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total Split Value (₹)",
    get: (rows) => rows.filter((r) => r.flagged === "yes").reduce((s, r) => s + Number(r.po_total ?? 0), 0).toLocaleString(),
    color: (v) => (Number(String(v).replace(/,/g, "")) > 0 ? "var(--red)" : "var(--green)"),
  },
];

export default function PoSplitting() {
  return (
    <CrudTab
      endpoint="/po-splitting"
      title="Detect PO Splitting"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
