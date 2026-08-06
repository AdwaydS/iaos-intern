import type { ModuleConfig } from "../registry";
import CapexProjectsPage from "./CapexProjectsPage";

const config: ModuleConfig = {
  slug: "capex_projects",
  title: "Capex & Projects",
  description: "Capex & Projects — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: CapexProjectsPage,
};

export default config;
