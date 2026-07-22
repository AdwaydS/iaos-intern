import type { ModuleConfig } from "../registry";
import SalesDistributionPage from "./SalesDistributionPage";

const config: ModuleConfig = {
  slug: "sales_distribution",
  title: "Sales & Distribution",
  description: "Sales & Distribution — audit module.",
  icon: "trending-up",
  group: "Revenue & Customers",
  component: SalesDistributionPage,
};

export default config;
