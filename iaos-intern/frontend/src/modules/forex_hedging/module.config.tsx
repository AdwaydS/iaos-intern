import type { ModuleConfig } from "../registry";
import ForexHedgingPage from "./ForexHedgingPage";

const config: ModuleConfig = {
  slug: "forex_hedging",
  title: "Forex & Hedging",
  description: "Forex & Hedging — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: ForexHedgingPage,
};

export default config;
