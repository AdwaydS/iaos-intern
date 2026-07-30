import type { ModuleConfig } from "../registry";
import CashPettyCashPage from "./CashPettyCashPage";

const config: ModuleConfig = {
  slug: "cash_petty_cash",
  title: "Cash & Petty Cash",
  description:
    "Controls over physical cash: imprest limits, surprise counts, voucher support, and statutory cash-payment limits.",
  icon: "wallet",
  group: "Finance & Close",
  component: CashPettyCashPage,
};

export default config;
