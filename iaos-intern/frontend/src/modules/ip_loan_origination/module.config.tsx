import type { ModuleConfig } from "../registry";
import IpLoanOriginationPage from "./IpLoanOriginationPage";

const config: ModuleConfig = {
  slug: "ip_loan_origination",
  title: "Loan Origination",
  description: "Loan Origination — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "BFSI",
  component: IpLoanOriginationPage,
};

export default config;
