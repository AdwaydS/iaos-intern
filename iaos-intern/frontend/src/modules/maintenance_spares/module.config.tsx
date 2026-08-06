import type { ModuleConfig } from "../registry";
import MaintenanceSparesPage from "./MaintenanceSparesPage";

const config: ModuleConfig = {
  slug: "maintenance_spares",
  title: "Maintenance & Spares",
  description: "Maintenance & Spares — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: MaintenanceSparesPage,
};

export default config;
