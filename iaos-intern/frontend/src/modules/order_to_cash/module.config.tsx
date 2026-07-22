import type { ModuleConfig } from "../registry";
import OrderToCashPage from "./OrderToCashPage";

const config: ModuleConfig = {
  slug: "order_to_cash",
  title: "Order-to-Cash",
  description: "Order-to-Cash — audit module.",
  icon: "trending-up",
  group: "Revenue & Customers",
  component: OrderToCashPage,
};

export default config;
