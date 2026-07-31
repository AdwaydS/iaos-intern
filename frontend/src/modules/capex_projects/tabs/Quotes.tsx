import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { yesNoBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "item_desc", label: "Item Description" },
  { key: "quote_count", label: "Quotes Obtained", type: "number" },
  { key: "best_quote", label: "Best Quote", type: "number" },
  { key: "chosen_quote", label: "Chosen Quote", type: "number" },
  { key: "compliant", label: "Compliant", type: "select", options: ["yes", "no"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "item_desc", label: "Item" },
  { key: "quote_count", label: "Quotes" },
  { key: "best_quote", label: "Best", format: "amount" },
  { key: "chosen_quote", label: "Chosen", format: "amount" },
  {
    key: "gap_pct",
    label: "Gap %",
    format: "pct",
    color: (r) => (Number(r.gap_pct) > 15 ? "var(--red)" : undefined),
  },
  { key: "compliant", label: "Compliant", render: (r) => yesNoBadge(r.compliant) },
];

const summaries: SummaryDef[] = [
  {
    label: "Non-Compliant",
    get: (rows) => rows.filter((r) => r.compliant === "no").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Avg Quote Gap",
    get: (rows) =>
      rows.length
        ? `${(rows.reduce((s, r) => s + Number(r.gap_pct ?? 0), 0) / rows.length).toFixed(1)}%`
        : "0%",
  },
];

export default function Quotes() {
  return (
    <CrudTab
      endpoint="/quotes"
      title="Review Quote Governance"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
