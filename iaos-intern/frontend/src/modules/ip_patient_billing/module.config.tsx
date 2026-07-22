import type { ModuleConfig } from "../registry";
import IpPatientBillingPage from "./IpPatientBillingPage";

const config: ModuleConfig = {
  slug: "ip_patient_billing",
  title: "Patient Billing",
  description: "Patient Billing — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "Healthcare/Pharma",
  component: IpPatientBillingPage,
};

export default config;
