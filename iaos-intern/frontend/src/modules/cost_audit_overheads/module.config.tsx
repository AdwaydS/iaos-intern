import type { ModuleConfig } from "../registry";
import CostAuditOverheadsPage from "./CostAuditOverheadsPage";

const config: ModuleConfig = {
  slug: "cost_audit_overheads",
  title: "Cost Audit & Overheads",
  description: "Cost Audit & Overheads — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: CostAuditOverheadsPage,
};

export default config;
