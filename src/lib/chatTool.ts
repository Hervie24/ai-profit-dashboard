import { buildProfitSnapshot, getAllCampaignStats } from "@/lib/profitEngine";
import { generateInsights } from "@/lib/insights";

// A single tool the model uses to ground every answer in real computed
// numbers instead of guessing. Keeping one flexible "query" tool (rather than
// one tool per question type) keeps the agent loop to a single round trip
// for most questions while still covering products, channels, and insights.
export const PROFIT_DATA_TOOL = {
  name: "query_profit_data",
  description:
    "Look up computed e-commerce profitability data. Call this before answering any question about revenue, profit, margin, ad spend, ROAS, or specific products/channels — never guess numbers.",
  input_schema: {
    type: "object" as const,
    properties: {
      view: {
        type: "string" as const,
        enum: ["product_profit", "channel_spend", "insights", "totals"],
        description:
          "product_profit: per-product revenue/costs/net profit/margin, sorted by net profit descending. channel_spend: per ad-channel spend/attributed revenue/ROAS. insights: proactive list of problems and opportunities. totals: store-wide revenue/profit/margin/spend.",
      },
    },
    required: ["view"],
    additionalProperties: false,
  },
};

export async function runProfitDataTool(view: string): Promise<unknown> {
  const snapshot = await buildProfitSnapshot();

  switch (view) {
    case "product_profit":
      return snapshot.products.map((p) => ({
        product: p.product.title,
        category: p.product.category,
        unitsSold: p.unitsSold,
        revenue: round(p.revenue),
        cogs: round(p.cogs),
        shippingCost: round(p.shippingCost),
        paymentFees: round(p.paymentFees),
        adSpend: round(p.adSpend),
        netProfit: round(p.netProfit),
        marginPct: round(p.marginPct),
      }));
    case "channel_spend":
      return snapshot.channels.map((c) => ({
        channel: c.channel,
        spend: round(c.spend),
        attributedRevenue: round(c.attributedRevenue),
        roas: round(c.roas),
      }));
    case "insights":
      return generateInsights(snapshot);
    case "totals":
      return {
        revenue: round(snapshot.totals.revenue),
        netProfit: round(snapshot.totals.netProfit),
        adSpend: round(snapshot.totals.adSpend),
        marginPct: round(snapshot.totals.marginPct),
        campaignCount: (await getAllCampaignStats()).length,
      };
    default:
      return { error: `Unknown view: ${view}` };
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
