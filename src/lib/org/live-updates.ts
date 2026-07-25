export const ORG_UPDATED_EVENT = "acme:org-updated";

/** Broadcast when SSE / webhook-driven refresh lands so other surfaces can soft-reload. */
export function broadcastOrgUpdated(detail?: { notifyAt?: string }): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ORG_UPDATED_EVENT, { detail }));
}
