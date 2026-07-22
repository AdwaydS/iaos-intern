import type { ModuleConfig } from "../registry";
import IpProjectBillingPage from "./IpProjectBillingPage";

const config: ModuleConfig = {
  slug: "ip_project_billing",
  title: "Project Billing",
  description: "Project Billing — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "IT/Services",
  component: IpProjectBillingPage,
};

export default config;
