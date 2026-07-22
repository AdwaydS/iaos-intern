import type { ModuleConfig } from "../registry";
import GstPage from "./GstPage";

const config: ModuleConfig = {
  slug: "gst",
  title: "GST",
  description: "GST — audit module.",
  icon: "scale",
  group: "Tax, Legal & Compliance",
  component: GstPage,
};

export default config;
