import { withPersonSearchParam } from "@/lib/org/deep-links";

export const PROFILE_RETURN_STORAGE_KEY = "acme-org-chart:profile-return";

export type ProfileReturnState = {
  href: string;
  label: string;
  scrollY: number;
  personId: string;
  capturedAt: number;
};

function scrollContainerTop(): number {
  if (typeof document === "undefined") return 0;
  const people = document.querySelector<HTMLElement>("[data-people-scroll]");
  if (people) return people.scrollTop;
  const page = document.querySelector<HTMLElement>("[data-product-scroll]");
  if (page) return page.scrollTop;
  return window.scrollY;
}

function labelForPath(pathname: string): string {
  if (pathname.includes("/people")) return "People";
  if (pathname === "/app" || pathname.endsWith("/app")) return "Org Chart";
  if (pathname.includes("/dashboard")) return "Dashboard";
  return "Back";
}

/** Snapshot where the user was before opening a full profile. */
export function captureProfileReturn(personId: string): ProfileReturnState {
  const pathname = window.location.pathname || "/app";
  const search = window.location.search || "";
  let href = `${pathname}${search}`;

  // Chart: keep the selected person in the URL so return restores the dock.
  if (pathname === "/app" || pathname.endsWith("/app")) {
    href = `/app${withPersonSearchParam(search, personId)}`;
  }

  const state: ProfileReturnState = {
    href,
    label: labelForPath(pathname),
    scrollY: scrollContainerTop(),
    personId,
    capturedAt: Date.now(),
  };

  try {
    window.sessionStorage.setItem(
      PROFILE_RETURN_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // ignore quota / private mode
  }
  return state;
}

export function readProfileReturn(
  forPersonId?: string,
): ProfileReturnState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PROFILE_RETURN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileReturnState;
    if (!parsed?.href || !parsed.personId) return null;
    if (forPersonId && parsed.personId !== forPersonId) return null;
    // Stale after 30 minutes
    if (Date.now() - (parsed.capturedAt ?? 0) > 30 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProfileReturn(): void {
  try {
    window.sessionStorage.removeItem(PROFILE_RETURN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Restore scroll after navigating back from a profile. */
export function restoreProfileReturnScroll(scrollY: number): void {
  if (typeof window === "undefined") return;
  const apply = () => {
    const people = document.querySelector<HTMLElement>("[data-people-scroll]");
    if (people) {
      people.scrollTop = scrollY;
      return;
    }
    const page = document.querySelector<HTMLElement>("[data-product-scroll]");
    if (page) {
      page.scrollTop = scrollY;
      return;
    }
    window.scrollTo(0, scrollY);
  };
  requestAnimationFrame(() => {
    apply();
    window.setTimeout(apply, 50);
    window.setTimeout(apply, 200);
  });
}

/**
 * If we just returned from a profile to this href, restore scroll and clear.
 * Call once from the destination workspace on mount.
 */
export function consumeReturnScrollIfMatching(pathname: string): void {
  const state = readProfileReturn();
  if (!state) return;
  try {
    const url = new URL(state.href, window.location.origin);
    if (url.pathname !== pathname) return;
  } catch {
    return;
  }
  restoreProfileReturnScroll(state.scrollY);
  clearProfileReturn();
}

export function defaultProfileReturn(): ProfileReturnState {
  return {
    href: "/app/people",
    label: "People",
    scrollY: 0,
    personId: "",
    capturedAt: Date.now(),
  };
}
