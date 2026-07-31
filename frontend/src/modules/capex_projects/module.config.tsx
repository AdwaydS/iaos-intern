import type { ModuleConfig } from "../registry";
import CapexProjectsPage from "./CapexProjectsPage";

const config: ModuleConfig = {
  slug: "capex_projects",
  title: "Capex & Project Monitoring",
  description:
    "Assurance over capital projects: AFE/budget control, cost-and-time overrun tracking, capitalisation timing and competitive-quote governance.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  industry: "Manufacturing, Infra, Real Estate",
  component: CapexProjectsPage,
};

export default config;
