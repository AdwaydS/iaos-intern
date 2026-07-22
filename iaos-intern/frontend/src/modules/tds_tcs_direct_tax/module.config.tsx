import type { ModuleConfig } from "../registry";
import TdsTcsDirectTaxPage from "./TdsTcsDirectTaxPage";

const config: ModuleConfig = {
  slug: "tds_tcs_direct_tax",
  title: "TDS/TCS & Direct Tax",
  description: "TDS/TCS & Direct Tax — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: TdsTcsDirectTaxPage,
};

export default config;
