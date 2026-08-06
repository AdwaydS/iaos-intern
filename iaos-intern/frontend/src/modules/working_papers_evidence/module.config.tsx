import type { ModuleConfig } from "../registry";
import WorkingPapersEvidencePage from "./WorkingPapersEvidencePage";

const config: ModuleConfig = {
  slug: "working_papers_evidence",
  title: "Working Papers & Evidence",
  description: "Working Papers & Evidence — audit module.",
  icon: "file-check",
  group: "Audit Command Center",
  component: WorkingPapersEvidencePage,
};

export default config;
