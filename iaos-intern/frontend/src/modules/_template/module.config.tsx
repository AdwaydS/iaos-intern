import type { ModuleConfig } from "../registry";
import TemplatePage from "./TemplatePage";

/**
 * Module manifest. Copy this whole folder to start your module:
 *   cp -r src/modules/_template src/modules/<your-slug>
 * Then set `slug` to match your BACKEND module folder name exactly.
 */
const config: ModuleConfig = {
  slug: "_template",
  title: "Template Module",
  description: "Reference module — copy me to build yours.",
  icon: "clipboard",
  group: "Other", // navigation group (see GROUPS in registry.ts)
  // industry: "BFSI", // only for Industry Packs modules
  component: TemplatePage,
  // roles: ["auditor", "tenant_admin"], // optional visibility control
};

export default config;
