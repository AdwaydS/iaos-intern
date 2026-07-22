import type { ModuleConfig } from "../registry";
import SoftwareLicensePage from "./SoftwareLicensePage";

const config: ModuleConfig = {
  slug: "software_license",
  title: "Software License & SaaS Spend",
  description:
    "License-vs-usage true-up, shadow IT, renewal governance and audit-exposure risk.",
  icon: "server",
  group: "Technology & Resilience",
  component: SoftwareLicensePage,
};

export default config;
