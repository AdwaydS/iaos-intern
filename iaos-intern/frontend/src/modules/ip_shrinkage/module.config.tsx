import type { ModuleConfig } from "../registry";
import IpShrinkagePage from "./IpShrinkagePage";

const config: ModuleConfig = {
  slug: "ip_shrinkage",
  title: "Shrinkage",
  description: "Shrinkage — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Retail/FMCG",
  component: IpShrinkagePage,
};

export default config;
