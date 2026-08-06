import type { ModuleConfig } from "../registry";
import IpUtilizationPage from "./IpUtilizationPage";

const config: ModuleConfig = {
  slug: "ip_utilization",
  title: "Utilization",
  description: "Utilization — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "IT/Services",
  component: IpUtilizationPage,
};

export default config;
