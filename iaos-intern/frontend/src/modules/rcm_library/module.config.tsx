import type { ModuleConfig } from "../registry";
import RcmLibraryPage from "./RcmLibraryPage";

const config: ModuleConfig = {
  slug: "rcm_library",
  title: "RCM Library",
  description: "RCM Library — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: RcmLibraryPage,
};

export default config;
