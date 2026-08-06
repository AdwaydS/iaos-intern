import type { ModuleConfig } from "../registry";
import ExpenseCostControlsPage from "./ExpenseCostControlsPage";

const config: ModuleConfig = {
  slug: "expense_cost_controls",
  title: "Expense & Cost Controls",
  description: "Expense & Cost Controls — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: ExpenseCostControlsPage,
};

export default config;
