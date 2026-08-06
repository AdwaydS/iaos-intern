import type { ModuleConfig } from "../registry";
import InventoryStoresPage from "./InventoryStoresPage";

const config: ModuleConfig = {
  slug: "inventory_stores",
  title: "Inventory & Stores",
  description: "Inventory & Stores — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: InventoryStoresPage,
};

export default config;
