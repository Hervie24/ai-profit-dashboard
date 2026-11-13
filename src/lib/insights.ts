import { getAllCampaignStats, ProfitSnapshot } from "@/lib/profitEngine";

export type Insight = {
  severity: "critical" | "warning" | "opportunity";
  title: string;
  detail: string;
};

// Rule-based proactive monitoring: scans the unified profit snapshot and
// campaign data for problems and opportunities a store owner would want
// surfaced without having to ask. This is deliberately simple threshold
// logic for the POC — the same shape of function is where a heavier
// anomaly-detection or forecasting model would plug in later.
export async function generateInsights(snapshot: ProfitSnapshot): Promise<Insight[]> {
  const insights: Insight[] = [];
  const campaigns = await getAllCampaignStats();

  for (const p of snapshot.products) {
    if (p.netProfit < 0) {
      insights.push({
        severity: "critical",
        title: `${p.product.title} is losing money`,
        detail: `Net loss of $${Math.abs(p.netProfit).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })} after COGS, returns, shipping, fees, and ad spend. Revenue $${p.revenue.toLocaleString(
          undefined,
          { maximumFractionDigits: 0 }
        )} isn't covering costs — consider raising price, cutting ad spend on this product, or renegotiating COGS.`,
      });
    } else if (p.marginPct < 10 && p.adSpend > 0) {
      insights.push({
        severity: "warning",
        title: `${p.product.title} margin is thin (${p.marginPct.toFixed(1)}%)`,
        detail: `Profitable but barely — ad spend of $${p.adSpend.toLocaleString()} is eating most of the margin. Worth testing a lower CPA target before scaling spend further.`,
      });
    }
  }

  for (const c of campaigns) {
    const roas = c.spend > 0 ? c.conversionValue / c.spend : 0;
    if (roas < 1 && c.spend > 500) {
      insights.push({
        severity: "critical",
        title: `${c.campaignName} is spending more than it returns`,
        detail: `ROAS of ${roas.toFixed(2)}x on $${c.spend.toLocaleString()} spend (${c.channel.replace(
          "_",
          " "
        )}). Recommend pausing or cutting budget until creative/targeting improves.`,
      });
    }
  }

  const best = snapshot.products[0];
  if (best && best.netProfit > 0) {
    insights.push({
      severity: "opportunity",
      title: `${best.product.title} is your most profitable product`,
      detail: `Net profit of $${best.netProfit.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })} at a ${best.marginPct.toFixed(1)}% margin. A strong candidate to increase ad budget on, if campaign ROAS allows.`,
    });
  }

  const severityRank = { critical: 0, warning: 1, opportunity: 2 };
  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
}
