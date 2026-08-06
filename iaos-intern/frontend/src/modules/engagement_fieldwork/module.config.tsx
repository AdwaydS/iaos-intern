import type { ModuleConfig } from "../registry";
import EngagementFieldworkPage from "./EngagementFieldworkPage";

const config: ModuleConfig = {
  slug: "engagement_fieldwork",
  title: "Engagement & Fieldwork",
  description: "Engagement & Fieldwork — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: EngagementFieldworkPage,
};

export default config;
