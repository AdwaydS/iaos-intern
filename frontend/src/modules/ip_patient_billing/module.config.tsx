import type { ModuleConfig } from "../registry";
import IpPatientBillingPage from "./IpPatientBillingPage";

const config: ModuleConfig = {
  slug: "ip_patient_billing",
  title: "Patient Billing & Revenue Cycle",
  description:
    "Assurance over the hospital revenue cycle: charge capture, package/tariff integrity, TPA/insurance claims and revenue leakage at every touchpoint.",
  icon: "wallet",
  group: "Industry Packs",
  industry: "Healthcare",
  component: IpPatientBillingPage,
};

export default config;
