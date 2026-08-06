import type { ModuleConfig } from "../registry";
import ProductionPage from "./ProductionPage";

const config: ModuleConfig = {
  slug: "production",
  title: "Production",
  description: "Production — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: ProductionPage,
};

export default config;
