// Shared domain types every connector normalizes into.
// Real connectors (live Shopify/Google Ads/Meta APIs) should map their
// provider-specific payloads into these same shapes so the profit engine,
// insights engine, and chat tool never need to know where data came from.

export type Product = {
  id: string;
  handle: string;
  title: string;
  category: string;
};

export type ShopifyProductStats = {
  productId: string;
  unitsSold: number;
  revenue: number;
  returns: number;
  cogs: number;
  shippingCost: number;
  paymentFees: number;
};

export type AdChannel = "google_ads" | "meta_ads" | "tiktok_ads";

export type AdCampaignStats = {
  channel: AdChannel;
  campaignId: string;
  campaignName: string;
  productId: string | null; // null = brand/non-product-specific campaign
  spend: number;
  clicks: number;
  impressions: number;
  conversions: number;
  conversionValue: number;
};

export type DataConnector = {
  source: string;
  getProducts(): Promise<Product[]>;
};

export type CommerceConnector = DataConnector & {
  getProductStats(): Promise<ShopifyProductStats[]>;
};

export type AdsConnector = DataConnector & {
  getCampaignStats(): Promise<AdCampaignStats[]>;
};
