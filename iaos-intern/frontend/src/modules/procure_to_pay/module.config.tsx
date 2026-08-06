import type { ModuleConfig } from "../registry";
import ProcureToPayPage from "./ProcureToPayPage";

const config: ModuleConfig = {
  slug: "procure_to_pay",
  title: "Procure-to-Pay",
  description: "Procure-to-Pay — audit module.",
  icon: "cart",
  group: "Procurement & Spend",
  component: ProcureToPayPage,
};

export default config;
