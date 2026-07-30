import type { ModuleConfig } from "../registry";
import PosStoreAuditPage from "./PosStoreAuditPage";

const config: ModuleConfig = {
  slug: "pos_store_audit",
  title: "Point-of-Sale & Store Audit",
  description: "Store-level assurance over POS integrity, cash/card reconciliation, discount abuse detection, and shrinkage tracking.",
  icon: "cart",
  group: "Revenue & Customers",
  industry: "Retail",
  component: PosStoreAuditPage,
};

export default config;
