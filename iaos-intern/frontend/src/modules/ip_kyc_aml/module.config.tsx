import type { ModuleConfig } from "../registry";
import IpKycAmlPage from "./IpKycAmlPage";

const config: ModuleConfig = {
  slug: "ip_kyc_aml",
  title: "KYC-AML",
  description: "KYC-AML — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "BFSI",
  component: IpKycAmlPage,
};

export default config;
