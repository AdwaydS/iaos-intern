import type { ModuleConfig } from "../registry";
import LogisticsFreightPage from "./LogisticsFreightPage";

const config: ModuleConfig = {
  slug: "logistics_freight",
  title: "Logistics & Freight",
  description: "Logistics & Freight — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: LogisticsFreightPage,
};

export default config;
