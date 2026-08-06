import type { ModuleConfig } from "../registry";
import StatutoryDuesPage from "./StatutoryDuesPage";

const config: ModuleConfig = {
  slug: "statutory_dues",
  title: "Statutory Dues",
  description: "Statutory Dues — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: StatutoryDuesPage,
};

export default config;
