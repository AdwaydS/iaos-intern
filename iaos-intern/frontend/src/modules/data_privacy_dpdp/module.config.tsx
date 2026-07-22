import type { ModuleConfig } from "../registry";
import DataPrivacyDpdpPage from "./DataPrivacyDpdpPage";

const config: ModuleConfig = {
  slug: "data_privacy_dpdp",
  title: "Data Privacy (DPDP)",
  description: "Data Privacy (DPDP) — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: DataPrivacyDpdpPage,
};

export default config;
