import type { ModuleConfig } from "../registry";
import ContinuousMonitoringPage from "./ContinuousMonitoringPage";

const config: ModuleConfig = {
  slug: "continuous_monitoring",
  title: "Continuous Monitoring",
  description: "Continuous Monitoring — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: ContinuousMonitoringPage,
};

export default config;
