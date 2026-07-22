import type { ModuleConfig } from "../registry";
import BusinessContinuityDrPage from "./BusinessContinuityDrPage";

const config: ModuleConfig = {
  slug: "business_continuity_dr",
  title: "Business Continuity & DR",
  description:
    "Confirms the organisation can survive disruption: BIA currency, DR testing, RTO/RPO adherence and crisis governance.",
  icon: "server",
  group: "IT & Security",
  component: BusinessContinuityDrPage,
};

export default config;
