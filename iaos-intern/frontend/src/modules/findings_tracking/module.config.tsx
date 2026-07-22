import type { ModuleConfig } from "../registry";
import FindingsTrackingPage from "./FindingsTrackingPage";

const config: ModuleConfig = {
  slug: "findings_tracking",
  title: "Findings Tracking",
  description: "Findings Tracking — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: FindingsTrackingPage,
};

export default config;
