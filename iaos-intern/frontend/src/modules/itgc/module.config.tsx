import type { ModuleConfig } from "../registry";
import ItgcPage from "./ItgcPage";

const config: ModuleConfig = {
  slug: "itgc",
  title: "ITGC",
  description: "ITGC — audit module.",
  icon: "server",
  group: "Technology & Resilience",
  component: ItgcPage,
};

export default config;
