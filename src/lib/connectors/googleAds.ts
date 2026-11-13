import { AdsConnector, AdCampaignStats, Product } from "@/lib/types";
import { GOOGLE_ADS_STATS, PRODUCTS } from "@/lib/data/seed";

// Mock Google Ads connector. A real implementation would call the Google
// Ads API (via google-ads-api / the official client library) with an
// OAuth refresh token + developer token, run a GAQL report for campaign
// metrics, and map rows into AdCampaignStats.
export const googleAdsConnector: AdsConnector = {
  source: "google_ads",
  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  },
  async getCampaignStats(): Promise<AdCampaignStats[]> {
    return GOOGLE_ADS_STATS;
  },
};
