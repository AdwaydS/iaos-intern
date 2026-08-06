import type { ModuleConfig } from "../registry";
import IpDrugGmpPage from "./IpDrugGmpPage";

const config: ModuleConfig = {
  slug: "ip_drug_gmp",
  title: "Drug/GMP",
  description: "Drug/GMP — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Healthcare/Pharma",
  component: IpDrugGmpPage,
};

export default config;
