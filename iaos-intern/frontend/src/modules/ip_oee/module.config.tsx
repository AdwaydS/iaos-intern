import type { ModuleConfig } from "../registry";
import IpOeePage from "./IpOeePage";

const config: ModuleConfig = {
  slug: "ip_oee",
  title: "OEE",
  description: "OEE — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Manufacturing",
  component: IpOeePage,
};

export default config;
