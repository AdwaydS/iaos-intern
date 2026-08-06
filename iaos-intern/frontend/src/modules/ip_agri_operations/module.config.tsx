import type { ModuleConfig } from "../registry";
import IpAgriOperationsPage from "./IpAgriOperationsPage";

const config: ModuleConfig = {
  slug: "ip_agri_operations",
  title: "Agri Operations",
  description: "Agri Operations — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Agri",
  component: IpAgriOperationsPage,
};

export default config;
