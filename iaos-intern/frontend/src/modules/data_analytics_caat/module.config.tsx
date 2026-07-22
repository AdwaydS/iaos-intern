import type { ModuleConfig } from "../registry";
import DataAnalyticsCaatPage from "./pages/DataAnalyticsCaatPage";

const config: ModuleConfig = {
  slug: "data_analytics_caat",
  title: "Data Analytics & CAAT",
  description: "Data Analytics & CAAT — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: DataAnalyticsCaatPage,
};

export default config;
