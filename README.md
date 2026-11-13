# AI Profit Dashboard — Proof of Concept

An AI-based monitoring and control system for e-commerce profitability — not another reporting dashboard. It connects Shopify, Google Ads, and Meta Ads into a single source of truth for *true* profit (revenue minus COGS, returns, shipping, payment fees, and ad spend), surfaces problems and opportunities on its own, and lets you ask it questions in plain language.

This POC runs on realistic **mock data** shaped exactly like the real providers' API responses, so swapping in live credentials later only touches the connector files — nothing else in the app changes.

## What it does

- **Unified profit engine** — joins Shopify order/product data with Google Ads and Meta Ads spend to compute net profit and margin per product, and spend/ROAS per channel. This is the single definition of "true profit" the whole app reads from.
- **Proactive insights** — a rule-based monitor that flags products losing money, campaigns spending more than they return, thin-margin products carrying heavy ad spend, and the best scale-up candidate. No need to ask — it's always running.
- **AI chat (Claude)** — ask things like *"Which products are most profitable after all costs?"* or *"Where are we losing money?"*. The model calls a tool that queries the real computed data before answering, so it's grounded in numbers rather than guessing.

## Architecture

```
src/lib/types.ts            Shared domain types every connector normalizes into
src/lib/connectors/         One file per data source (shopify, googleAds, meta),
                             all implementing CommerceConnector / AdsConnector
src/lib/data/seed.ts        Mock data shaped like real API responses
src/lib/profitEngine.ts     Joins connector data into per-product / per-channel profit
src/lib/insights.ts         Rule-based proactive monitoring over the profit snapshot
src/lib/chatTool.ts         The tool Claude calls to query real profit data
src/app/api/chat/route.ts   Chat endpoint: Claude + tool-use loop
src/app/page.tsx            Dashboard (KPIs, product table, channel cards, insights)
src/components/ChatPanel.tsx Chat UI
```

**Why this shape is easy to extend:** every data source — however different its real API is — only has to produce `Product[]`, `ShopifyProductStats[]`, or `AdCampaignStats[]` (see `src/lib/types.ts`). The profit engine, insights engine, and chat tool never know or care where the data came from. Adding TikTok Ads, GA4, or a second Shopify store means writing one new connector file and registering it in `src/lib/connectors/index.ts` — nothing downstream changes.

### Adding a real data source (e.g. swapping mock Shopify for live)

1. Open `src/lib/connectors/shopify.ts`.
2. Replace the body of `getProducts()` / `getProductStats()` with real Shopify Admin API calls (REST or GraphQL), using a store access token from `process.env.SHOPIFY_ACCESS_TOKEN`.
3. Map the API response into the existing `Product` / `ShopifyProductStats` shapes.

That's it — the profit engine, insights, dashboard, and chat tool keep working unchanged.

### Extending to TikTok Ads or GA4

- **TikTok Ads**: write `src/lib/connectors/tiktok.ts` implementing `AdsConnector` (same shape as `googleAds.ts` / `meta.ts`), add `"tiktok_ads"` to the `AdChannel` type in `src/lib/types.ts`, and add the connector to `adsConnectors` in `src/lib/connectors/index.ts`. It immediately shows up in channel spend/ROAS and in the insights engine.
- **GA4**: write a connector that returns a new `SessionStats`-style type (sessions, conversions, bounce rate per product/channel) and join it into `profitEngine.ts` alongside ad spend, so marketing efficiency can be judged against actual traffic and behavior, not just ad-platform-reported conversions.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. The dashboard and insights work immediately (they're pure server-side computation over mock data). The chat panel needs `ANTHROPIC_API_KEY` set — get one at https://console.anthropic.com/.

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the `ANTHROPIC_API_KEY` environment variable in the Vercel project settings.
4. Deploy — no other configuration needed (no database, no external services besides the Anthropic API).

## What a production version would add

- Real OAuth-based connectors for Shopify, Google Ads, Meta, TikTok, and GA4, with scheduled syncs into a real datastore instead of in-request mock data.
- A scheduled job (cron / Managed Agent) that runs the insights engine continuously and pushes alerts (Slack/email) instead of only surfacing them on page load.
- Historical trend data so insights can catch *changes* ("ROAS dropped 30% this week"), not just snapshot thresholds.
- Per-user/store auth and multi-tenant data isolation.
