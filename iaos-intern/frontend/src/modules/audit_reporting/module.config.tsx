import type { ModuleConfig } from "../registry";
import AuditReportingPage from "./AuditReportingPage";

const config: ModuleConfig = {
  slug: "audit_reporting",
  title: "Audit Reporting",
  description: "Audit Reporting — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: AuditReportingPage,
};

export default config;
