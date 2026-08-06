import type { ModuleConfig } from "../registry";
import JournalEntriesR2rPage from "./JournalEntriesR2rPage";

const config: ModuleConfig = {
  slug: "journal_entries_r2r",
  title: "Journal Entries & R2R",
  description: "Journal Entries & R2R — audit module.",
  icon: "wallet",
  group: "Finance & Close",
  component: JournalEntriesR2rPage,
};

export default config;
