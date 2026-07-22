import type { ModuleConfig } from "../registry";
import InsurancePage from "./InsurancePage";

const config: ModuleConfig = {
  slug: "insurance",
  title: "Insurance",
  description: "Insurance — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: InsurancePage,
};

export default config;
