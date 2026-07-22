import type { ModuleConfig } from "../registry";
import IpSaasSpendPage from "./IpSaasSpendPage";

const config: ModuleConfig = {
  slug: "ip_saas_spend",
  title: "SaaS Spend",
  description: "SaaS Spend — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "IT/Services",
  component: IpSaasSpendPage,
};

export default config;
