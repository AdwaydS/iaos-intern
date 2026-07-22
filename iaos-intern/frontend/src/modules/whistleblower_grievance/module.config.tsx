import type { ModuleConfig } from "../registry";
import WhistleblowerGrievancePage from "./WhistleblowerGrievancePage";

const config: ModuleConfig = {
  slug: "whistleblower_grievance",
  title: "Whistleblower & Grievance",
  description: "Whistleblower & Grievance — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: WhistleblowerGrievancePage,
};

export default config;
