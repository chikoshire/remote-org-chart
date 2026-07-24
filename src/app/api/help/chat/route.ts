import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  APP_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session";
import { retrieveHelpChunks } from "@/lib/help/load-help";
import { searchPeople, type SearchablePerson } from "@/lib/org/search-people";
import { readOrgChartSnapshot } from "@/lib/org/snapshot-cache";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 20;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

function allowRate(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX) return false;
  bucket.count += 1;
  return true;
}

function looksLikePersonQuery(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(who is|find|search|locate|where is|look up)\b/.test(t) ||
    /\b(manager|reports? to|title|department)\b/.test(t)
  );
}

function looksLikeOrgStatsQuery(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(how many|headcount|team size|number of people|people in (the )?team|total people)\b/.test(
      t,
    ) || /\b(count|size of)\b/.test(t)
  );
}

async function peopleFromSnapshot(): Promise<
  Array<SearchablePerson & { department?: string | null; country?: string | null }>
> {
  const snap = await readOrgChartSnapshot();
  const nodes = (
    snap as {
      nodes?: Array<{
        id: string;
        fullName?: string | null;
        jobTitle?: string | null;
        department?: string | null;
        country?: string | null;
      }>;
      nodeCount?: number;
    } | null
  )?.nodes;
  if (!nodes?.length) return [];
  return nodes.map((n) => ({
    id: n.id,
    fullName: n.fullName ?? null,
    jobTitle: n.jobTitle ?? null,
    department: n.department ?? null,
    country: n.country ?? null,
  }));
}

export async function POST(request: Request) {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(APP_SESSION_COOKIE)?.value);
  if (!session.ok) {
    return NextResponse.json(
      { ok: false, message: "Sign in to use the Help assistant." },
      { status: 401 },
    );
  }

  if (!allowRate(clientKey(request))) {
    return NextResponse.json(
      {
        ok: false,
        message: "Assistant rate limit reached. Try again in a bit.",
      },
      { status: 429 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = (await request.json()) as { messages?: ChatMessage[] };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const messages = (body.messages ?? [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-8);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return NextResponse.json(
      { ok: false, message: "Send a user message." },
      { status: 400 },
    );
  }

  const chunks = retrieveHelpChunks(lastUser.content, 3);
  const kbBlock = chunks
    .map((c) => `### ${c.title} (/help/${c.slug})\n${c.markdown}`)
    .join("\n\n");

  let peopleBlock = "";
  let statsBlock = "";
  const needPeople =
    looksLikePersonQuery(lastUser.content) ||
    looksLikeOrgStatsQuery(lastUser.content);
  if (needPeople) {
    const people = await peopleFromSnapshot();
    if (looksLikeOrgStatsQuery(lastUser.content) && people.length > 0) {
      const depts = new Map<string, number>();
      for (const p of people) {
        const d = p.department?.trim() || "Unknown";
        depts.set(d, (depts.get(d) ?? 0) + 1);
      }
      const topDepts = [...depts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name}: ${count}`)
        .join("; ");
      statsBlock = `Active people in the current org snapshot: ${people.length}. Top departments: ${topDepts}.`;
    }
    if (looksLikePersonQuery(lastUser.content)) {
      const hits = searchPeople(people, lastUser.content, 5);
      if (hits.length) {
        peopleBlock = hits
          .map(
            (p) =>
              `- ${p.fullName ?? "Unknown"} (${p.jobTitle ?? "Title not set"}; profile /app/people/${p.id})`,
          )
          .join("\n");
      }
    }
  }

  const system = [
    "You are the Acme Org Chart Help assistant.",
    "Answer briefly using the Help knowledge base and optional org facts.",
    "Never invent demo passwords or API tokens. Credentials are shared privately.",
    "If unsure, point the user to /help or the relevant product surface.",
    "Prefer linking to /help/<slug> or /app/people/<id> when useful.",
    "",
    "## Help knowledge base",
    kbBlock || "(no matching help pages)",
    statsBlock ? `\n## Org snapshot stats\n${statsBlock}` : "",
    peopleBlock ? `\n## People matches\n${peopleBlock}` : "",
  ].join("\n");

  type AiBinding = {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  let ai: AiBinding | null = null;
  try {
    const { env } = getCloudflareContext();
    const binding = (env as { AI?: AiBinding }).AI;
    if (binding) ai = binding;
  } catch {
    ai = null;
  }

  if (!ai) {
    const fallback =
      chunks.length > 0
        ? `I can help from the Help docs. Start with **${chunks[0]!.title}**: /help/${chunks[0]!.slug}. (Workers AI is available on the deployed Worker.)`
        : "Open /help for product how-tos. The AI assistant runs on the deployed Cloudflare Worker.";
    return NextResponse.json({
      ok: true,
      reply: fallback,
      citations: chunks.map((c) => ({ slug: c.slug, title: c.title })),
      offline: true,
    });
  }

  try {
    const result = (await ai.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [{ role: "system", content: system }, ...messages],
      max_tokens: 512,
    })) as { response?: string; result?: string };

    const reply =
      (typeof result?.response === "string" && result.response.trim()) ||
      (typeof result?.result === "string" && result.result.trim()) ||
      "I could not generate a reply. Try /help.";

    return NextResponse.json({
      ok: true,
      reply,
      citations: chunks.map((c) => ({ slug: c.slug, title: c.title })),
    });
  } catch (err) {
    const raw =
      err instanceof Error
        ? err.message
        : "Assistant failed. Try again or open /help.";
    const message = /deprecated|5028/i.test(raw)
      ? "The help model needs a quick update on the server. Open /help for how-tos in the meantime."
      : raw;
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
