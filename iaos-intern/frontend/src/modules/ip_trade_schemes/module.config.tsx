import type { ModuleConfig } from "../registry";
import IpTradeSchemesPage from "./IpTradeSchemesPage";

const config: ModuleConfig = {
  slug: "ip_trade_schemes",
  title: "Trade Schemes",
  description: "Trade Schemes — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Retail/FMCG",
  component: IpTradeSchemesPage,
};

export default config;
