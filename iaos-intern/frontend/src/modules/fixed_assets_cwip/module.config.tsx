/**
 * Fixed Assets & CWIP — Module Configuration (Module 18)
 * ========================================================
 *
 * This file is auto-discovered by the frontend module registry
 * (see `registry.ts`). It maps the module slug to its page
 * component, title, icon, and navigation group.
 *
 * The `slug` MUST match the backend module folder name exactly
 * ("fixed_assets_cwip") for API routing to work.
 *
 * @see registry.ts — auto-discovery via import.meta.glob
 * @see FixedAssetsCwipPage.tsx — the rendered page component
 */

import type { ModuleConfig } from "../registry";
import FixedAssetsCwipPage from "./FixedAssetsCwipPage";

const config: ModuleConfig = {
  /** URL-safe slug — MUST match backend module folder name */
  slug: "fixed_assets_cwip",

  /** Display title shown in navigation and breadcrumbs */
  title: "Fixed Assets & CWIP",

  /** Short description for module catalogues and tooltips */
  description:
    "Verifies asset existence, recomputes depreciation, and controls " +
    "capex-to-capitalisation including CWIP ageing and disposal governance.",

  /** Icon from the shared SVG set (see components/Icon.tsx) */
  icon: "building",

  /** Navigation group (see GROUPS in registry.ts) */
  group: "Treasury, Assets & Capital",

  /** Lazy-loaded page component */
  component: FixedAssetsCwipPage,

  // Uncomment to restrict visibility by role:
  // roles: ["auditor", "tenant_admin"],
};

export default config;
