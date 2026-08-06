import type { ModuleConfig } from "../registry";
import IpReraPage from "./IpReraPage";

const config: ModuleConfig = {
  slug: "ip_rera",
  title: "RERA",
  description: "RERA — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Real Estate/Infra",
  component: IpReraPage,
};

export default config;
