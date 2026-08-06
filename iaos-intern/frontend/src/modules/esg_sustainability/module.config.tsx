import type { ModuleConfig } from "../registry";
import EsgSustainabilityPage from "./EsgSustainabilityPage";

const config: ModuleConfig = {
  slug: "esg_sustainability",
  title: "ESG & Sustainability",
  description: "ESG & Sustainability — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: EsgSustainabilityPage,
};

export default config;
