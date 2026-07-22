import type { ModuleConfig } from "../registry";
import BoardCommitteeReportingPage from "./BoardCommitteeReportingPage";

const config: ModuleConfig = {
  slug: "board_committee_reporting",
  title: "Board/Committee Reporting",
  description: "Board/Committee Reporting — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: BoardCommitteeReportingPage,
};

export default config;
