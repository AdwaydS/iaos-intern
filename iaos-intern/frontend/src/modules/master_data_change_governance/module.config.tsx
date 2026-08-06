import type { ModuleConfig } from "../registry";
import MasterDataChangeGovernancePage from "./MasterDataChangeGovernancePage";

const config: ModuleConfig = {
  slug: "master_data_change_governance",
  title: "Master Data Change Governance",
  description: "Cross-cutting oversight of critical master data with change control and integrity analytics.",
  icon: "shield",
  group: "Controls, Risk & Fraud",
  component: MasterDataChangeGovernancePage,
};

export default config;
