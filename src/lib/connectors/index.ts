import { AdsConnector, CommerceConnector } from "@/lib/types";
import { shopifyConnector } from "./shopify";
import { googleAdsConnector } from "./googleAds";
import { metaAdsConnector } from "./meta";

// Registry of connected data sources. Adding a new source (TikTok Ads,
// GA4, a second Shopify store, ...) means writing one connector that
// implements CommerceConnector or AdsConnector and listing it here —
// the profit engine and insights engine iterate this list generically.
export const commerceConnectors: CommerceConnector[] = [shopifyConnector];
export const adsConnectors: AdsConnector[] = [googleAdsConnector, metaAdsConnector];
