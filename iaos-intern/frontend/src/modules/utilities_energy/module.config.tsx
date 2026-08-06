import type { ModuleConfig } from "../registry";
import UtilitiesEnergyPage from "./UtilitiesEnergyPage";

const config: ModuleConfig = {
  slug: "utilities_energy",
  title: "Utilities & Energy",
  description:
    "Assurance over power, fuel and utility costs: consumption vs output, " +
    "tariff/contract-demand optimisation, and loss/leakage analytics.",
  icon: "activity",
  group: "Supply Chain & Operations",
  component: UtilitiesEnergyPage,
};

export default config;