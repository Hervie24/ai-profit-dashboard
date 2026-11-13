import { CommerceConnector, Product, ShopifyProductStats } from "@/lib/types";
import { PRODUCTS, SHOPIFY_PRODUCT_STATS } from "@/lib/data/seed";

// Mock Shopify connector. A real implementation would call the Shopify
// Admin API (REST or GraphQL) with a store access token and map the
// response into the same Product / ShopifyProductStats shapes, e.g.:
//
//   const res = await fetch(`https://${shop}.myshopify.com/admin/api/2024-10/orders.json`, {
//     headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN! },
//   });
//
// Nothing outside this file needs to change to go live.
export const shopifyConnector: CommerceConnector = {
  source: "shopify",
  async getProducts(): Promise<Product[]> {
    return PRODUCTS;
  },
  async getProductStats(): Promise<ShopifyProductStats[]> {
    return SHOPIFY_PRODUCT_STATS;
  },
};
