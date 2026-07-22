import type { ModuleConfig } from "../registry";
import VendorMasterPage from "./VendorMasterPage";

const config: ModuleConfig = {
  slug: "vendor_master",
  title: "Vendor Master",
  description: "Vendor Master — audit module.",
  icon: "cart",
  group: "Procurement & Spend",
  component: VendorMasterPage,
};

export default config;
