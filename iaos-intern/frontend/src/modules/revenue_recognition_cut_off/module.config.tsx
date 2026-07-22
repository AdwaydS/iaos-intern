import type { ModuleConfig } from "../registry";
import RevenueRecognitionCutOffPage from "./RevenueRecognitionCutOffPage";

const config: ModuleConfig = {
  slug: "revenue_recognition_cut_off",
  title: "Revenue Recognition & Cut-off",
  description: "Revenue Recognition & Cut-off — audit module.",
  icon: "trending-up",
  group: "Revenue & Customers",
  component: RevenueRecognitionCutOffPage,
};

export default config;
