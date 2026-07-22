import type { ModuleConfig } from "../registry";
import BudgetingVariancePage from "./BudgetingVariancePage";

const config: ModuleConfig = {
  slug: "budgeting_variance",
  title: "Budgeting & Variance Analysis",
  description:
    "Reviews the budgeting process and variances: pre-approval timing, chronic overspend heads, re-budget governance and assumption reasonableness.",
  icon: "wallet",
  group: "Finance & Close",
  component: BudgetingVariancePage,
};

export default config;
