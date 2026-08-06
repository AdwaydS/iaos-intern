import type { ModuleConfig } from "../registry";
import DoaSodPage from "./DoaSodPage";

const config: ModuleConfig = {
  slug: "doa_sod",
  title: "DOA & SoD",
  description: "DOA & SoD — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: DoaSodPage,
};

export default config;
