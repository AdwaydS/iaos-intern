import type { ModuleConfig } from "../registry";
import BorrowingsCovenantsPage from "./BorrowingsCovenantsPage";

const config: ModuleConfig = {
  slug: "borrowings_covenants",
  title: "Borrowings & Covenants",
  description: "Borrowings & Covenants — audit module.",
  icon: "building",
  group: "Treasury, Assets & Capital",
  component: BorrowingsCovenantsPage,
};

export default config;
