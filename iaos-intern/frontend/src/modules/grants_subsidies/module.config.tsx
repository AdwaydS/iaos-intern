import type { ModuleConfig } from "../registry";
import GrantsSubsidiesPage from "./GrantsSubsidiesPage";

const config: ModuleConfig = {
  slug: "grants_subsidies",
  title: "Grants & Subsidies",
  description: "Grants & Subsidies — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: GrantsSubsidiesPage,
};

export default config;
