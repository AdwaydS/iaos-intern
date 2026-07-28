/**
 * Frontend module auto-discovery — the counterpart to the backend loader.
 *
 * Every module folder exports a default `ModuleConfig` from `module.config.tsx`.
 * Vite's `import.meta.glob` finds them all at build time, so NO shared file
 * lists modules. An intern adds a folder → their module appears. 80 branches,
 * zero merge conflicts on any registry.
 *
 * Folders whose name starts with "_" (e.g. _template) are ignored.
 */
import type { ComponentType } from "react";
import type { Role } from "../lib/types";
import type { IconName } from "../components/Icon";

export interface ModuleConfig {
  /** URL-safe id; MUST match the backend module folder name. */
  slug: string;
  title: string;
  description: string;
  /** Icon name from the shared SVG set (see components/Icon.tsx). No emojis. */
  icon: IconName;
  /** Navigation group this module belongs to (see GROUP_ORDER below). */
  group?: string;
  /** Sub-classification within Industry Packs (e.g. "BFSI"). */
  industry?: string;
  /** Lazy-loaded page component rendered at /app/m/<slug>. */
  component: ComponentType;
  /** Optional: restrict which roles see this module. */
  roles?: Role[];
}

/** Canonical order + icon for each navigation group. */
export const GROUPS: { name: string; icon: IconName }[] = [
  { name: "Audit Command Center", icon: "file-check" },
  { name: "Controls, Risk & Fraud", icon: "shield" },
  { name: "Finance & Close", icon: "wallet" },
  { name: "Treasury, Assets & Capital", icon: "building" },
  { name: "Procurement & Spend", icon: "cart" },
  { name: "Revenue & Customers", icon: "trending-up" },
  { name: "Supply Chain & Operations", icon: "truck" },
  { name: "Tax, Legal & Compliance", icon: "scale" },
  { name: "Technology & Resilience", icon: "server" },
  { name: "Industry Packs", icon: "grid" },
];

const GROUP_INDEX = new Map(GROUPS.map((g, i) => [g.name, i]));
const UNGROUPED = "Other";

export interface GroupedModules {
  name: string;
  icon: IconName;
  modules: ModuleConfig[];
}

/** Group modules by their `group`, ordered per GROUPS. */
export function groupModules(mods: ModuleConfig[]): GroupedModules[] {
  const byGroup = new Map<string, ModuleConfig[]>();
  for (const m of mods) {
    const g = m.group ?? UNGROUPED;
    (byGroup.get(g) ?? byGroup.set(g, []).get(g)!).push(m);
  }
  return [...byGroup.entries()]
    .sort(
      ([a], [b]) =>
        (GROUP_INDEX.get(a) ?? 99) - (GROUP_INDEX.get(b) ?? 99) ||
        a.localeCompare(b)
    )
    .map(([name, modules]) => ({
      name,
      icon: GROUPS.find((g) => g.name === name)?.icon ?? "layers",
      modules: modules.sort((x, y) => x.title.localeCompare(y.title)),
    }));
}

const modules = import.meta.glob("./*/module.config.tsx", { eager: true });

export const MODULES: ModuleConfig[] = Object.entries(modules)
  .filter(([path]) => !path.includes("/_")) // skip _template
  .map(([, mod]) => (mod as { default: ModuleConfig }).default)
  .sort((a, b) => a.title.localeCompare(b.title));

export function modulesForRole(role: Role): ModuleConfig[] {
  if (!role || role === "super_admin" || role === "tenant_admin") {
    return MODULES;
  }
  const roleMods = MODULES.filter((m) => !m.roles || m.roles.includes(role));
  return roleMods.length > 0 ? roleMods : MODULES;
}

export function findModule(slug: string): ModuleConfig | undefined {
  if (!slug) return undefined;
  const rawSegment = slug.replace(/^\/+|\/+$/g, "").split("/")[0].split("?")[0].toLowerCase();
  const cleanSlug = rawSegment.replace(/-/g, "_");
  const strippedSlug = cleanSlug.replace(/_audit$/g, "").replace(/_module$/g, "");

  return MODULES.find((m) => {
    const mSlug = m.slug.toLowerCase().replace(/-/g, "_");
    const mStripped = mSlug.replace(/_audit$/g, "").replace(/_module$/g, "");
    return (
      m.slug === slug ||
      mSlug === cleanSlug ||
      mStripped === strippedSlug ||
      mSlug === strippedSlug ||
      strippedSlug === mSlug
    );
  });
}
