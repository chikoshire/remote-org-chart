"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";

type ChatTurn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I compare two people?",
  "What does Refresh from Remote do?",
  "How do local profile fixes work?",
];

export function HelpChatWidget() {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content:
        "Ask about the Dashboard, Org Chart, People, Data Health, or sync. I use the Help docs and can look up people by name.",
    },
  ]);

  const openPanel = useCallback(() => {
    setOpen(true);
  }, []);

  const scrollFeedToEnd = useCallback((behavior: ScrollBehavior = "smooth") => {
    const feed = feedRef.current;
    if (!feed) return;
    if (typeof feed.scrollTo === "function") {
      feed.scrollTo({ top: feed.scrollHeight, behavior });
    } else {
      feed.scrollTop = feed.scrollHeight;
    }
  }, []);

  useEffect(() => {
    const onOpen = () => openPanel();
    window.addEventListener("acme:open-help-chat", onOpen);
    return () => window.removeEventListener("acme:open-help-chat", onOpen);
  }, [openPanel]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    scrollFeedToEnd(messages.length <= 2 ? "auto" : "smooth");
  }, [busy, messages, open, scrollFeedToEnd]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatTurn[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/help/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        reply?: string;
        message?: string;
      };
      const reply =
        body.ok && body.reply
          ? body.reply
          : (body.message ?? "Something went wrong. Try /help.");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Open /help or try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="pointer-events-none fixed bottom-10 right-4 z-40 flex flex-col items-end gap-3 md:bottom-12 md:right-6">
      {open ? (
        <section
          aria-labelledby={titleId}
          className="pointer-events-auto flex h-[min(28rem,70dvh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-norma-lg border border-norma-border bg-norma-surface shadow-norma-md"
        >
          <header className="flex items-center justify-between gap-2 border-b border-norma-border/80 px-3 py-2.5">
            <div>
              <h2
                id={titleId}
                className="text-sm font-semibold text-norma-prussian"
              >
                Help assistant
              </h2>
              <Link
                href="/help"
                className="text-[11px] font-medium text-norma-royal hover:underline"
              >
                Browse Help
              </Link>
            </div>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-xs text-norma-ink-muted hover:bg-norma-surface-muted hover:text-norma-ink"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </header>
          <div
            ref={feedRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}`}
                className={`rounded-norma-md px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-6 bg-norma-ink text-norma-ink-inverse"
                    : "mr-4 bg-norma-lavender/50 text-norma-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy ? (
              <div className="mr-4 rounded-norma-md bg-norma-lavender/40 px-3 py-2 text-sm text-norma-ink-muted">
                Thinking…
              </div>
            ) : null}
            {messages.length <= 1 ? (
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="cursor-pointer rounded-full border border-norma-border bg-norma-surface px-2.5 py-1 text-[11px] font-medium text-norma-ink-muted hover:text-norma-prussian"
                    onClick={() => void send(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <form
            onSubmit={onSubmit}
            className="flex gap-2 border-t border-norma-border/80 p-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              disabled={busy}
              className="min-w-0 flex-1 rounded-norma-md border border-norma-border bg-norma-canvas px-2.5 py-2 text-sm outline-none focus:border-norma-ink"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-norma-md bg-norma-ink px-3 py-2 text-xs font-semibold text-norma-ink-inverse disabled:opacity-50"
            >
              {busy ? "…" : "Send"}
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        className="pointer-events-auto inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-norma-ink text-norma-ink-inverse shadow-norma-md hover:opacity-95"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        aria-label={open ? "Close help assistant" : "Open help assistant"}
        title={open ? "Close help" : "Help"}
      >
        {open ? (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9.4a2.5 2.5 0 1 1 3.5 3.3c-.7.5-1.1 1-1.1 1.8" />
            <path d="M12 17h.01" />
          </svg>
        )}
      </button>
    </div>
  );
}
