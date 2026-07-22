import type { ModuleConfig } from "../registry";
import IpRaBillsPage from "./IpRaBillsPage";

const config: ModuleConfig = {
  slug: "ip_ra_bills",
  title: "RA Bills",
  description: "RA Bills — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Real Estate/Infra",
  component: IpRaBillsPage,
};

export default config;
