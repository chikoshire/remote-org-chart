import { NextResponse } from "next/server";
import { readOrgChartNotifyAt } from "@/lib/org/snapshot-cache";

export const runtime = "nodejs";

/**
 * Lightweight SSE stream (GH#28). Emits `org-updated` when the KV notify
 * stamp changes (webhook invalidation).
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let lastNotify: string | null = null;
  let interval: ReturnType<typeof setInterval> | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      send("hello", { ok: true, at: new Date().toISOString() });

      const tick = async () => {
        try {
          const notifyAt = await readOrgChartNotifyAt();
          if (notifyAt && notifyAt !== lastNotify) {
            const isFirst = lastNotify === null;
            lastNotify = notifyAt;
            if (!isFirst) {
              send("org-updated", { notifyAt });
            }
          }
        } catch {
          // Keep the stream alive; next tick retries.
        }
      };

      void tick();
      interval = setInterval(() => {
        void tick();
      }, 4000);
      heartbeat = setInterval(() => {
        send("ping", { at: new Date().toISOString() });
      }, 25000);

      request.signal.addEventListener("abort", () => {
        if (interval) clearInterval(interval);
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      if (interval) clearInterval(interval);
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
