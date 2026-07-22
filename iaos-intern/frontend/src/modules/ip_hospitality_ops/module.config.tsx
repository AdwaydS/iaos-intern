import type { ModuleConfig } from "../registry";
import IpHospitalityOpsPage from "./IpHospitalityOpsPage";

const config: ModuleConfig = {
  slug: "ip_hospitality_ops",
  title: "Hospitality Ops",
  description: "Hospitality Ops — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Hospitality",
  component: IpHospitalityOpsPage,
};

export default config;
