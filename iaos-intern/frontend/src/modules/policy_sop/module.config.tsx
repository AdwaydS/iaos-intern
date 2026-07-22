import type { ModuleConfig } from "../registry";
import PolicySopPage from "./PolicySopPage";

const config: ModuleConfig = {
  slug: "policy_sop",
  title: "Policy & SOP",
  description:
    "Enterprise Policy and Standard Operating Procedure Management — policies, approvals, attestations, exceptions, gap analysis, breach reports, remediations, observations, regulations, risk controls, templates, working papers, and more.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: PolicySopPage,
};

export default config;
