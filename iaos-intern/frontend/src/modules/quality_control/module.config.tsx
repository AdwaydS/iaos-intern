import type { ModuleConfig } from "../registry";
import QualityControlPage from "./QualityControlPage";

const config: ModuleConfig = {
  slug: "quality_control",
  title: "Quality Control",
  description: "Quality Control — audit module.",
  icon: "truck",
  group: "Supply Chain & Operations",
  component: QualityControlPage,
};

export default config;
