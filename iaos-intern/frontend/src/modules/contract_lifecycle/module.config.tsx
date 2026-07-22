import type { ModuleConfig } from "../registry";
import ContractLifecyclePage from "./ContractLifecyclePage";

const config: ModuleConfig = {
  slug: "contract_lifecycle",
  title: "Contract Lifecycle",
  description: "Contract Lifecycle — audit module.",
  icon: "cart",
  group: "Procurement & Spend",
  component: ContractLifecyclePage,
};

export default config;
