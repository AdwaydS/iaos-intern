import type { ModuleConfig } from "../registry";
import IpFleetManagementPage from "./IpFleetManagementPage";

const config: ModuleConfig = {
  slug: "ip_fleet_management",
  title: "Fleet Management",
  description: "Fleet Management — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Fleet",
  component: IpFleetManagementPage,
};

export default config;
