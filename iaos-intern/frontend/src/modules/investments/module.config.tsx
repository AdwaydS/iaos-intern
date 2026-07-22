import React from "react";
import { Building } from "lucide-react";
import InvestmentsPage from "./InvestmentsPage";
import type { ModuleConfig } from "../registry";

const config: ModuleConfig = {
  slug: "investments",
  title: "Investments",
  description: "Investments — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: InvestmentsPage,
};

export default config;
