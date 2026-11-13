import { AdsConnector, AdCampaignStats, Product } from "@/lib/types";
import { META_ADS_STATS, PRODUCTS } from "@/lib/data/seed";

// Mock Meta (Facebook/Instagram) Ads connector. A real implementation would
// call the Meta Marketing API's /insights endpoint for the ad account with
// a long-lived access token and map rows into AdCampaignStats.
export const metaAdsConnector: AdsConnector = {
  source: "meta_ads",
  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  },
  async getCampaignStats(): Promise<AdCampaignStats[]> {
    return META_ADS_STATS;
  },
};
