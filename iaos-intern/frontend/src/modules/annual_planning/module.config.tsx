import type { ModuleConfig } from "../registry";
import AnnualPlanningPage from "./AnnualPlanningPage";

const config: ModuleConfig = {
  slug: "annual_planning",
  title: "Annual Planning",
  description: "Annual Planning — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: AnnualPlanningPage,
};

export default config;
