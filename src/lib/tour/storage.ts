export const PRODUCT_TOUR_STORAGE_KEY = "acme-org-chart:product-tour-v1";

export const PRODUCT_TOUR_START_EVENT = "acme:start-product-tour";

export function isProductTourDone(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(PRODUCT_TOUR_STORAGE_KEY) === "done";
  } catch {
    return true;
  }
}

export function markProductTourDone(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRODUCT_TOUR_STORAGE_KEY, "done");
  } catch {
    // ignore quota / private mode
  }
}

export function requestProductTour(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PRODUCT_TOUR_START_EVENT));
}
