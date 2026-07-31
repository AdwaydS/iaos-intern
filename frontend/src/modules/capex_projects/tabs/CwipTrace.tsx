import CrudTab, { type FieldDef, type ColumnDef, type SummaryDef } from "./CrudTab";
import { statusBadge, yesNoBadge } from "./badges";

const fields: FieldDef[] = [
  { key: "project_name", label: "Project Name", required: true },
  { key: "capex_spend", label: "Capex Spend", type: "number" },
  { key: "cwip_balance", label: "CWIP Balance", type: "number" },
  { key: "fa_transfer", label: "FA Register Transfer", type: "number" },
  { key: "traced", label: "Fully Traced", type: "select", options: ["yes", "no"] },
  { key: "status", label: "Status", type: "select", options: ["pending", "in_progress", "reviewed"] },
  { key: "notes", label: "Notes" },
];

const columns: ColumnDef[] = [
  { key: "project_name", label: "Project" },
  { key: "capex_spend", label: "Capex Spend", format: "amount" },
  { key: "cwip_balance", label: "CWIP", format: "amount" },
  { key: "fa_transfer", label: "FA Transfer", format: "amount" },
  { key: "traced", label: "Traced", render: (r) => yesNoBadge(r.traced) },
  { key: "status", label: "Status", render: (r) => statusBadge(String(r.status)) },
];

const summaries: SummaryDef[] = [
  {
    label: "Not Fully Traced",
    get: (rows) => rows.filter((r) => r.traced === "no").length,
    color: (v) => (Number(v) > 0 ? "var(--red)" : "var(--green)"),
  },
  {
    label: "Total CWIP Parked",
    get: (rows) =>
      rows.reduce((s, r) => s + Number(r.cwip_balance ?? 0), 0).toLocaleString(),
  },
];

export default function CwipTrace() {
  return (
    <CrudTab
      endpoint="/cwip-trace"
      title="Trace Spend to Asset Register"
      fields={fields}
      columns={columns}
      summaries={summaries}
    />
  );
}
