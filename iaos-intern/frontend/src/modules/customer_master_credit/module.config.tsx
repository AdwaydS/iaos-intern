import type { ModuleConfig } from "../registry";
import CustomerMasterCreditPage from "./CustomerMasterCreditPage";

const config: ModuleConfig = {
  slug: "customer_master_credit",
  title: "Customer Master & Credit",
  description: "Customer Master & Credit — audit module.",
  icon: "trending-up",
  group: "Revenue & Customers",
  component: CustomerMasterCreditPage,
};

export default config;
