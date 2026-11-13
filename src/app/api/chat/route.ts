import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { PROFIT_DATA_TOOL, runProfitDataTool } from "@/lib/chatTool";

const SYSTEM_PROMPT = `You are the AI layer of a profit-monitoring dashboard for an e-commerce store (Shopify + Google Ads + Meta Ads in this proof of concept; more channels are planned). You answer questions about true profitability — net of COGS, returns, shipping, payment fees, and ad spend — and proactively point out risks and opportunities.

Always call query_profit_data before stating any number. Be concrete: name products, channels, and dollar figures. When asked a vague question like "where are we losing money", check both product_profit and channel_spend before answering. Keep answers short — a few sentences or a short list, not a report.`;

type ChatRequest = {
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
};

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const { message, history = [] }: ChatRequest = await req.json();
  const client = new Anthropic();

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  try {
    for (let iteration = 0; iteration < 4; iteration++) {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: [PROFIT_DATA_TOOL],
        messages,
      });

      if (response.stop_reason === "refusal") {
        return NextResponse.json(
          { error: "The assistant declined to answer that question." },
          { status: 200 }
        );
      }

      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      if (toolUses.length === 0) {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n");
        return NextResponse.json({ reply: text });
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUses) {
        const view = (toolUse.input as { view: string }).view;
        const result = await runProfitDataTool(view);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }
      messages.push({ role: "user", content: toolResults });
    }
  } catch (err) {
    const detail = err instanceof Anthropic.APIError ? err.message : "Unexpected error.";
    return NextResponse.json(
      { error: `The AI backend couldn't complete this request: ${detail}` },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { error: "The assistant couldn't finish answering in time." },
    { status: 200 }
  );
}
