import type { ModuleConfig } from "../registry";
import IpBranchOpsPage from "./IpBranchOpsPage";

const config: ModuleConfig = {
  slug: "ip_branch_ops",
  title: "Branch Ops",
  description: "Branch Ops — audit module.",
  icon: "grid",
  group: "Industry Packs",
  industry: "BFSI",
  component: IpBranchOpsPage,
};

export default config;
