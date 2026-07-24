/** Motion helpers for morph/bloom navigation. Honour prefers-reduced-motion. */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function sanitizePersonId(personId: string): string {
  return personId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/** Shared-element name for a whole person card / drawer shell (legacy). */
export function personMorphName(personId: string): string {
  return `person-${sanitizePersonId(personId)}`;
}

/** Avatar circle morph partner across chart → drawer → profile. */
export function personAvatarMorphName(personId: string): string {
  return `person-avatar-${sanitizePersonId(personId)}`;
}

/** Display name morph partner. */
export function personNameMorphName(personId: string): string {
  return `person-name-${sanitizePersonId(personId)}`;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<void>) => {
    finished: Promise<void>;
  };
};

/**
 * Run a navigation update inside the View Transitions API when available.
 * Falls back to an immediate callback when unsupported or reduced-motion.
 */
export async function withViewTransition(
  update: () => void | Promise<void>,
): Promise<void> {
  if (prefersReducedMotion()) {
    await update();
    return;
  }
  const doc = document as ViewTransitionDocument;
  if (typeof doc.startViewTransition !== "function") {
    await update();
    return;
  }
  const transition = doc.startViewTransition(async () => {
    await update();
  });
  try {
    await transition.finished;
  } catch {
    // Transition aborted; destination state should already be applied.
  }
}
