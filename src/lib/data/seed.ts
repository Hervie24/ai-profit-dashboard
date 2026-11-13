import { AdCampaignStats, Product, ShopifyProductStats } from "@/lib/types";

// Mock data shaped like normalized output from real Shopify / Google Ads /
// Meta API responses, covering a trailing 30-day window for one e-commerce
// store. Swap the connector internals (src/lib/connectors/*) for real API
// calls without touching anything downstream.

export const PRODUCTS: Product[] = [
  { id: "p1", handle: "aurora-weighted-blanket", title: "Aurora Weighted Blanket", category: "Home" },
  { id: "p2", handle: "pulse-running-shoes", title: "Pulse Running Shoes", category: "Footwear" },
  { id: "p3", handle: "nimbus-travel-pillow", title: "Nimbus Travel Pillow", category: "Travel" },
  { id: "p4", handle: "ember-cast-iron-pan", title: "Ember Cast Iron Pan", category: "Kitchen" },
  { id: "p5", handle: "drift-wireless-earbuds", title: "Drift Wireless Earbuds", category: "Electronics" },
  { id: "p6", handle: "glow-desk-lamp", title: "Glow Desk Lamp", category: "Home" },
  { id: "p7", handle: "basecamp-insulated-bottle", title: "Basecamp Insulated Bottle", category: "Outdoor" },
];

export const SHOPIFY_PRODUCT_STATS: ShopifyProductStats[] = [
  { productId: "p1", unitsSold: 420, revenue: 37800, returns: 1850, cogs: 12600, shippingCost: 2940, paymentFees: 1123 },
  { productId: "p2", unitsSold: 310, revenue: 27900, returns: 2700, cogs: 11470, shippingCost: 2170, paymentFees: 830 },
  { productId: "p3", unitsSold: 260, revenue: 7800, returns: 180, cogs: 3900, shippingCost: 910, paymentFees: 232 },
  { productId: "p4", unitsSold: 150, revenue: 13500, returns: 420, cogs: 8250, shippingCost: 1350, paymentFees: 402 },
  { productId: "p5", unitsSold: 540, revenue: 43200, returns: 3600, cogs: 19440, shippingCost: 3240, paymentFees: 1285 },
  { productId: "p6", unitsSold: 95, revenue: 4750, returns: 95, cogs: 2850, shippingCost: 665, paymentFees: 142 },
  { productId: "p7", unitsSold: 610, revenue: 15250, returns: 305, cogs: 6710, shippingCost: 2135, paymentFees: 454 },
];

export const GOOGLE_ADS_STATS: AdCampaignStats[] = [
  { channel: "google_ads", campaignId: "ga-1", campaignName: "Shopping - Aurora Weighted Blanket", productId: "p1", spend: 5200, clicks: 3100, impressions: 98000, conversions: 180, conversionValue: 16200 },
  { channel: "google_ads", campaignId: "ga-2", campaignName: "Shopping - Pulse Running Shoes", productId: "p2", spend: 6100, clicks: 4200, impressions: 142000, conversions: 150, conversionValue: 13500 },
  { channel: "google_ads", campaignId: "ga-3", campaignName: "Shopping - Drift Wireless Earbuds", productId: "p5", spend: 4800, clicks: 3600, impressions: 110000, conversions: 260, conversionValue: 20800 },
  { channel: "google_ads", campaignId: "ga-4", campaignName: "Search - Glow Desk Lamp", productId: "p6", spend: 2100, clicks: 950, impressions: 31000, conversions: 28, conversionValue: 1400 },
  { channel: "google_ads", campaignId: "ga-5", campaignName: "Brand - General Search", productId: null, spend: 900, clicks: 2100, impressions: 54000, conversions: 95, conversionValue: 7600 },
];

export const META_ADS_STATS: AdCampaignStats[] = [
  { channel: "meta_ads", campaignId: "fb-1", campaignName: "Prospecting - Aurora Weighted Blanket", productId: "p1", spend: 7400, clicks: 5200, impressions: 410000, conversions: 210, conversionValue: 18900 },
  { channel: "meta_ads", campaignId: "fb-2", campaignName: "Retargeting - Pulse Running Shoes", productId: "p2", spend: 3100, clicks: 2600, impressions: 150000, conversions: 140, conversionValue: 12600 },
  { channel: "meta_ads", campaignId: "fb-3", campaignName: "Prospecting - Nimbus Travel Pillow", productId: "p3", spend: 3900, clicks: 3400, impressions: 220000, conversions: 95, conversionValue: 2850 },
  { channel: "meta_ads", campaignId: "fb-4", campaignName: "Prospecting - Ember Cast Iron Pan", productId: "p4", spend: 2600, clicks: 1800, impressions: 96000, conversions: 60, conversionValue: 5400 },
  { channel: "meta_ads", campaignId: "fb-5", campaignName: "Prospecting - Drift Wireless Earbuds", productId: "p5", spend: 9800, clicks: 7100, impressions: 480000, conversions: 300, conversionValue: 24000 },
  { channel: "meta_ads", campaignId: "fb-6", campaignName: "Prospecting - Basecamp Insulated Bottle", productId: "p7", spend: 1200, clicks: 1600, impressions: 88000, conversions: 180, conversionValue: 4500 },
];
