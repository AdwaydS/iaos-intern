import type { ModuleConfig } from "../registry";
import CashPettyCashPage from "./CashPettyCashPage";

const config: ModuleConfig = {
  slug: "cash_petty_cash",
  title: "Cash & Petty Cash",
  description: "Cash & Petty Cash — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: CashPettyCashPage,
};

export default config;
