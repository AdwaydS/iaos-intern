import type { ModuleConfig } from "../registry";
import SecretarialRocPage from "./SecretarialRocPage";

const config: ModuleConfig = {
  slug: "secretarial_roc",
  title: "Secretarial & ROC",
  description: "Secretarial & ROC — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: SecretarialRocPage,
};

export default config;
