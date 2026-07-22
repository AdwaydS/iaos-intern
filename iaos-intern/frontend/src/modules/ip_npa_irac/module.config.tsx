import type { ModuleConfig } from "../registry";
import IpNpaIracPage from "./IpNpaIracPage";

const config: ModuleConfig = {
  slug: "ip_npa_irac",
  title: "NPA/IRAC",
  description: "NPA/IRAC — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "BFSI",
  component: IpNpaIracPage,
};

export default config;
