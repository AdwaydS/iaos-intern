import type { ModuleConfig } from "../registry";
import ErpAccessIamPage from "./ErpAccessIamPage";

const config: ModuleConfig = {
  slug: "erp_access_iam",
  title: "Application & ERP Access (IAM)",
  description:
    "Governs who can do what inside the ERP: role design, joiner-mover-leaver, dormant accounts, SoD, and access recertification.",
  icon: "lock",
  group: "Technology & Resilience",
  component: ErpAccessIamPage,
};

export default config;
