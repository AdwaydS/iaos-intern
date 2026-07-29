import type { ModuleConfig } from "../registry";
import FixedAssetsCwipPage from "./FixedAssetsCwipPage";

const config: ModuleConfig = {
  slug: "fixed_assets_cwip",
  title: "Fixed Assets & CWIP",
  description: "Verifies asset existence, recomputes depreciation, and controls capex-to-capitalisation including CWIP ageing and disposal governance.",
  icon: "building",
  group: "Finance Cycles",
  component: FixedAssetsCwipPage,
};

export default config;
