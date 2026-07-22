import type { ModuleConfig } from "../registry";
import IfcIcfrTestingPage from "./IfcIcfrTestingPage";

const config: ModuleConfig = {
  slug: "ifc_icfr_testing",
  title: "IFC/ICFR Testing",
  description: "IFC/ICFR Testing — audit module.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: IfcIcfrTestingPage,
};

export default config;
