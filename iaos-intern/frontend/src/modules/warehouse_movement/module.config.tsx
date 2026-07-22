import type { ModuleConfig } from "../registry";
import WarehouseMovementPage from "./WarehouseMovementPage";

const config: ModuleConfig = {
  slug: "warehouse_movement",
  title: "Warehouse & Movement",
  description: "Warehouse & Movement — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: WarehouseMovementPage,
};

export default config;
