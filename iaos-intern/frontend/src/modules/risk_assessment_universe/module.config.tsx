import type { ModuleConfig } from "../registry";
import RiskAssessmentUniversePage from "./RiskAssessmentUniversePage";

const config: ModuleConfig = {
  slug: "risk_assessment_universe",
  title: "Risk Assessment & Universe",
  description: "Risk Assessment & Universe — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: RiskAssessmentUniversePage,
};

export default config;
