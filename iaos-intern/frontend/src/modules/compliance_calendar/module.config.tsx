import type { ModuleConfig } from "../registry";
import ComplianceCalendarPage from "./ComplianceCalendarPage";

const config: ModuleConfig = {
  slug: "compliance_calendar",
  title: "Compliance Calendar",
  description: "Compliance Calendar — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: ComplianceCalendarPage,
};

export default config;
