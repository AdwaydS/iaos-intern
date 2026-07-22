import type { ModuleConfig } from "../registry";
import IpPosPage from "./IpPosPage";

const config: ModuleConfig = {
  slug: "ip_pos",
  title: "POS",
  description: "POS — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Retail/FMCG",
  component: IpPosPage,
};

export default config;
