"use client";

import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which products are most profitable after all costs?",
  "Where are we losing money right now?",
  "Which marketing budgets should we optimize?",
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        { role: "assistant", content: data.reply ?? data.error ?? "No response." },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Something went wrong reaching the assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Ask the AI</h2>
        <p className="text-sm text-zinc-500">
          Grounded in the live profit data below — not a generic chatbot.
        </p>
      </div>

      <div className="flex min-h-[240px] flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end max-w-[85%] rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "self-start max-w-[85%] whitespace-pre-wrap rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            }
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-400 dark:bg-zinc-900">
            Thinking…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about profit, margins, or ad spend…"
          className="flex-1 rounded-lg border border-zinc-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Send
        </button>
      </form>
    </div>
  );
}
