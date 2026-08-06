import type { ModuleConfig } from "../registry";
import IpMeteringBillingPage from "./IpMeteringBillingPage";

const config: ModuleConfig = {
  slug: "ip_metering_billing",
  title: "Metering & Billing",
  description: "Metering & Billing — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Metering",
  component: IpMeteringBillingPage,
};

export default config;
