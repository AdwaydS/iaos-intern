import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "contractor", label: "Contractor", required: true },
  { key: "advance_amount", label: "Advance Amount", type: "number" },
  { key: "recovered_amount", label: "Recovered Amount", type: "number" },
  { key: "status", label: "Status", type: "select", options: ["open", "part_recovered", "recovered"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "contractor", label: "Contractor" },
  { key: "advance_amount", label: "Advance", format: "amount" },
  { key: "recovered_amount", label: "Recovered", format: "amount" },
  {
    key: "balance_amount",
    label: "Balance",
    format: "amount",
    color: (r) => (Number(r.balance_amount) > 0 ? "var(--red)" : "var(--green)"),
  },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Open Balances",
    get: (rows) => rows.filter((r) => Number(r.balance_amount) > 0).length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Outstanding (₹)",
    get: (rows) =>
      rows
        .reduce((s, r) => s + Math.max(0, Number(r.balance_amount ?? 0)), 0)
        .toLocaleString(),
    color: (v) => (Number(String(v).replace(/,/g, "")) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Recovery %",
    get: (rows) => {
      const adv = rows.reduce((s, r) => s + Number(r.advance_amount ?? 0), 0);
      const rec = rows.reduce((s, r) => s + Number(r.recovered_amount ?? 0), 0);
      return adv ? `${((rec / adv) * 100).toFixed(1)}%` : "0%";
    },
  },
];

export default function ContractorAdvance() {
  return (
    <CrudTab
      endpoint="/advances"
      title="Track Contractor Advance"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
