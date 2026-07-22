import type { ModuleConfig } from "../registry";
import GrantsIncentivesPage from "./GrantsIncentivesPage";

const config: ModuleConfig = {
  slug: "grants_incentives",
  title: "Grants, Subsidies & Incentives",
  description: "Tracks government grants, subsidies and incentive schemes for eligibility, claims, compliance and clawback risk.",
  icon: "💰",
  component: GrantsIncentivesPage,
};

export default config;
