import type { ModuleConfig } from "../registry";
import PayrollHrPage from "./PayrollHrPage";

const config: ModuleConfig = {
  slug: "payroll_hr",
  title: "Payroll & HR",
  description: "Payroll & HR — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: PayrollHrPage,
};

export default config;
