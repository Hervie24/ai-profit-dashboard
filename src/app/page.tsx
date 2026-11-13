import { buildProfitSnapshot } from "@/lib/profitEngine";
import { generateInsights } from "@/lib/insights";
import ChatPanel from "@/components/ChatPanel";

function money(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const SEVERITY_STYLE: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
  opportunity:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
};

export default async function Home() {
  const snapshot = await buildProfitSnapshot();
  const insights = await generateInsights(snapshot);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-zinc-950 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            AI Profit Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Shopify + Google Ads + Meta Ads, unified into true store profitability. Proof of
            concept running on sample data — see the README for how this connects to live
            accounts and extends to TikTok Ads &amp; GA4.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Net revenue" value={money(snapshot.totals.revenue)} />
          <KpiCard label="Net profit" value={money(snapshot.totals.netProfit)} accent />
          <KpiCard label="Total ad spend" value={money(snapshot.totals.adSpend)} />
          <KpiCard label="Blended margin" value={`${snapshot.totals.marginPct.toFixed(1)}%`} />
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-8 lg:col-span-3">
            <section>
              <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
                Product profitability
              </h2>
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-100 text-left text-zinc-500 dark:bg-zinc-900">
                    <tr>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Revenue</th>
                      <th className="px-3 py-2 font-medium">Ad spend</th>
                      <th className="px-3 py-2 font-medium">Net profit</th>
                      <th className="px-3 py-2 font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.products.map((p) => (
                      <tr
                        key={p.product.id}
                        className="border-t border-zinc-100 dark:border-zinc-900"
                      >
                        <td className="px-3 py-2 text-zinc-800 dark:text-zinc-200">
                          {p.product.title}
                        </td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {money(p.revenue)}
                        </td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {money(p.adSpend)}
                        </td>
                        <td
                          className={
                            "px-3 py-2 font-medium " +
                            (p.netProfit < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-emerald-600 dark:text-emerald-400")
                          }
                        >
                          {money(p.netProfit)}
                        </td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {p.marginPct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
                Channel spend &amp; ROAS
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {snapshot.channels.map((c) => (
                  <div
                    key={c.channel}
                    className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="text-sm font-medium capitalize text-zinc-900 dark:text-zinc-50">
                      {c.channel.replace("_", " ")}
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-zinc-500">
                      <span>Spend</span>
                      <span>{money(c.spend)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Attributed revenue</span>
                      <span>{money(c.attributedRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      <span>ROAS</span>
                      <span>{c.roas.toFixed(2)}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 font-semibold text-zinc-900 dark:text-zinc-50">
                Proactive insights
              </h2>
              <div className="flex flex-col gap-2">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border px-3 py-2 text-sm ${SEVERITY_STYLE[insight.severity]}`}
                  >
                    <div className="font-medium">{insight.title}</div>
                    <div className="mt-0.5 opacity-90">{insight.detail}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-2">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div
        className={
          "mt-1 text-xl font-semibold " +
          (accent ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-50")
        }
      >
        {value}
      </div>
    </div>
  );
}
