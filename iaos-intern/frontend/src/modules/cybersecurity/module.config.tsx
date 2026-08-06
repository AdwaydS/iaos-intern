import type { ModuleConfig } from "../registry";
import CybersecurityPage from "./CybersecurityPage";

const config: ModuleConfig = {
  slug: "cybersecurity",
  title: "Cybersecurity",
  description: "Cybersecurity — audit module.",
  icon: "server",
  group: "Technology & Resilience",
  component: CybersecurityPage,
};

export default config;
