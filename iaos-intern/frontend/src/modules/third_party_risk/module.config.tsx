import type { ModuleConfig } from "../registry";
import ThirdPartyRiskPage from "./ThirdPartyRiskPage";

const config: ModuleConfig = {
  slug: "third_party_risk",
  title: "Third-Party Risk",
  description: "Third-Party Risk — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: ThirdPartyRiskPage,
};

export default config;
