import type { ModuleConfig } from "../registry";
import CsrPage from "./CsrPage";

const config: ModuleConfig = {
  slug: "csr",
  title: "CSR",
  description: "CSR — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: CsrPage,
};

export default config;
