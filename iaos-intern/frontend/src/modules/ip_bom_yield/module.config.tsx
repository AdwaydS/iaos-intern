import type { ModuleConfig } from "../registry";
import IpBomYieldPage from "./IpBomYieldPage";

const config: ModuleConfig = {
  slug: "ip_bom_yield",
  title: "BOM & Yield",
  description: "BOM & Yield — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Manufacturing",
  component: IpBomYieldPage,
};

export default config;
