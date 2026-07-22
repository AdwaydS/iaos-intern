import type { ModuleConfig } from "../registry";
import LitigationTrackingPage from "./LitigationTrackingPage";

const config: ModuleConfig = {
  slug: "litigation_tracking",
  title: "Litigation Tracking",
  description: "Litigation Tracking — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: LitigationTrackingPage,
};

export default config;
