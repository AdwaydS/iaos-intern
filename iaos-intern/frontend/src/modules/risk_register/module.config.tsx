import type { ModuleConfig } from "../registry";
import RiskRegisterPage from "./RiskRegisterPage";

const config: ModuleConfig = {
  slug: "risk_register",
  title: "Risk Register",
  description: "Log, score, and track audit risks by likelihood × impact.",
  icon: "alert-triangle",
  group: "Audit Command Center",
  component: RiskRegisterPage,
};

export default config;
