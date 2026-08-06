import type { ModuleConfig } from "../registry";
import IpECommerceOpsPage from "./IpECommerceOpsPage";

const config: ModuleConfig = {
  slug: "ip_e_commerce_ops",
  title: "E-commerce Ops",
  description: "E-commerce Ops — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "E-commerce",
  component: IpECommerceOpsPage,
};

export default config;
