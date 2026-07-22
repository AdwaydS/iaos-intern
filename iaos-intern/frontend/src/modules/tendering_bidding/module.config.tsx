import type { ModuleConfig } from "../registry";
import TenderingBiddingPage from "./TenderingBiddingPage";

const config: ModuleConfig = {
  slug: "tendering_bidding",
  title: "Tendering & Bidding",
  description: "Tendering & Bidding — audit module.",
  icon: "cart",
  group: "Procurement & Spend",
  component: TenderingBiddingPage,
};

export default config;
