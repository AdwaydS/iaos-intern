import type { ModuleConfig } from "../registry";
import TreasuryBankingPage from "./TreasuryBankingPage";

const config: ModuleConfig = {
  slug: "treasury_banking",
  title: "Treasury & Banking",
  description: "Treasury & Banking — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: TreasuryBankingPage,
};

export default config;
