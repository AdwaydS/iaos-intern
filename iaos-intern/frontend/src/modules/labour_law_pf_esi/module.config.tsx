import type { ModuleConfig } from "../registry";
import LabourLawPfEsiPage from "./LabourLawPfEsiPage";

const config: ModuleConfig = {
  slug: "labour_law_pf_esi",
  title: "Labour Law & PF/ESI",
  description: "Labour Law & PF/ESI — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: LabourLawPfEsiPage,
};

export default config;
