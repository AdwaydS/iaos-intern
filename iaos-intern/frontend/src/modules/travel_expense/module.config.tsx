import type { ModuleConfig } from "../registry";
import TravelExpensePage from "./TravelExpensePage";

const config: ModuleConfig = {
  slug: "travel_expense",
  title: "Travel & Expense",
  description: "Travel & Expense — audit module.",
  icon: "cart",
  group: "Procurement & Spend",
  component: TravelExpensePage,
};

export default config;
