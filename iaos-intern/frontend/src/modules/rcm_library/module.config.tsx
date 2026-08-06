import type { ModuleConfig } from "../registry";
import RcmLibraryPage from "./RcmLibraryPage";

const config: ModuleConfig = {
  slug: "rcm_library",
  title: "RCM Library",
  description:
    "A centrally governed library of process risks and controls with assertions, control attributes and mapping to tests and regulations.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: RcmLibraryPage,
};

export default config;
