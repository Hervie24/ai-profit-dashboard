import { adsConnectors, commerceConnectors } from "@/lib/connectors";
import { AdCampaignStats, Product } from "@/lib/types";

export type ProductProfit = {
  product: Product;
  unitsSold: number;
  revenue: number;
  returns: number;
  cogs: number;
  shippingCost: number;
  paymentFees: number;
  adSpend: number;
  netProfit: number;
  marginPct: number;
};

export type ChannelSpend = {
  channel: string;
  spend: number;
  attributedRevenue: number;
  roas: number;
};

export type ProfitSnapshot = {
  products: ProductProfit[];
  channels: ChannelSpend[];
  totals: {
    revenue: number;
    netProfit: number;
    adSpend: number;
    marginPct: number;
  };
};

// Joins commerce data (Shopify) with ad spend (Google Ads, Meta, ...) into
// a single source of truth for profitability, per product and per channel.
// This is the only place "true profit" is defined — the dashboard, the
// insights engine, and the AI chat tool all read from here so their numbers
// never disagree.
export async function buildProfitSnapshot(): Promise<ProfitSnapshot> {
  const products: Product[] = [];
  for (const connector of commerceConnectors) {
    products.push(...(await connector.getProducts()));
  }

  const productStats = (
    await Promise.all(commerceConnectors.map((c) => c.getProductStats()))
  ).flat();

  const campaignStats: AdCampaignStats[] = (
    await Promise.all(adsConnectors.map((c) => c.getCampaignStats()))
  ).flat();

  const adSpendByProduct = new Map<string, number>();
  for (const c of campaignStats) {
    if (!c.productId) continue;
    adSpendByProduct.set(c.productId, (adSpendByProduct.get(c.productId) ?? 0) + c.spend);
  }

  const productProfits: ProductProfit[] = productStats.map((stats) => {
    const product = products.find((p) => p.id === stats.productId)!;
    const adSpend = adSpendByProduct.get(stats.productId) ?? 0;
    const netRevenue = stats.revenue - stats.returns;
    const netProfit =
      netRevenue - stats.cogs - stats.shippingCost - stats.paymentFees - adSpend;
    return {
      product,
      unitsSold: stats.unitsSold,
      revenue: netRevenue,
      returns: stats.returns,
      cogs: stats.cogs,
      shippingCost: stats.shippingCost,
      paymentFees: stats.paymentFees,
      adSpend,
      netProfit,
      marginPct: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0,
    };
  });

  const channelMap = new Map<string, { spend: number; attributedRevenue: number }>();
  for (const c of campaignStats) {
    const entry = channelMap.get(c.channel) ?? { spend: 0, attributedRevenue: 0 };
    entry.spend += c.spend;
    entry.attributedRevenue += c.conversionValue;
    channelMap.set(c.channel, entry);
  }
  const channels: ChannelSpend[] = Array.from(channelMap.entries()).map(
    ([channel, v]) => ({
      channel,
      spend: v.spend,
      attributedRevenue: v.attributedRevenue,
      roas: v.spend > 0 ? v.attributedRevenue / v.spend : 0,
    })
  );

  const totals = {
    revenue: productProfits.reduce((s, p) => s + p.revenue, 0),
    netProfit: productProfits.reduce((s, p) => s + p.netProfit, 0),
    adSpend: campaignStats.reduce((s, c) => s + c.spend, 0),
    marginPct: 0,
  };
  totals.marginPct = totals.revenue > 0 ? (totals.netProfit / totals.revenue) * 100 : 0;

  return {
    products: productProfits.sort((a, b) => b.netProfit - a.netProfit),
    channels,
    totals,
  };
}

// Raw per-campaign stats, exposed separately for the insights engine and
// chat tool, which need campaign-level ROAS rather than channel aggregates.
export async function getAllCampaignStats(): Promise<AdCampaignStats[]> {
  return (await Promise.all(adsConnectors.map((c) => c.getCampaignStats()))).flat();
}
