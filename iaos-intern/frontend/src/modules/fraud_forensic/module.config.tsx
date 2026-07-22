import type { ModuleConfig } from "../registry";
import FraudForensicPage from "./FraudForensicPage";

const config: ModuleConfig = {
  slug: "fraud_forensic",
  title: "Fraud & Forensic",
  description: "Fraud & Forensic — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: FraudForensicPage,
};

export default config;
