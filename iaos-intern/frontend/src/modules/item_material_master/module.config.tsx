import type { ModuleConfig } from "../registry";
import ItemMaterialMasterPage from "./ItemMaterialMasterPage";

const config: ModuleConfig = {
  slug: "item_material_master",
  title: "Item & Material Master",
  description: "Item & Material Master — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: ItemMaterialMasterPage,
};

export default config;
