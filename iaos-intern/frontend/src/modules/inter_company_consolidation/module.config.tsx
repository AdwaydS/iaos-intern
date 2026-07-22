import type { ModuleConfig } from "../registry";
import InterCompanyConsolidationPage from "./InterCompanyConsolidationPage";

const config: ModuleConfig = {
  slug: "inter_company_consolidation",
  title: "Inter-Company & Consolidation",
  description: "Inter-Company & Consolidation — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: InterCompanyConsolidationPage,
};

export default config;
