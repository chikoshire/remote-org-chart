/** Shared SVG map viewport math for the org chart world map. */

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 480;
export const MAX_ZOOM = 8;

export type MapView = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const WORLD_VIEW: MapView = {
  x: 0,
  y: 0,
  w: MAP_WIDTH,
  h: MAP_HEIGHT,
};

export function clampView(view: MapView): MapView {
  const w = Math.min(MAP_WIDTH, Math.max(MAP_WIDTH / MAX_ZOOM, view.w));
  const h = Math.min(MAP_HEIGHT, Math.max(MAP_HEIGHT / MAX_ZOOM, view.h));
  const x = Math.min(MAP_WIDTH - w, Math.max(0, view.x));
  const y = Math.min(MAP_HEIGHT - h, Math.max(0, view.y));
  return { x, y, w, h };
}

/**
 * Zoom around an anchor in map coordinates.
 * When already at min/max zoom, returns the same view so wheel inertia
 * cannot pan as a side-effect of a no-op zoom.
 */
export function zoomAtPoint(
  view: MapView,
  factor: number,
  anchorX: number,
  anchorY: number,
): MapView {
  if (!Number.isFinite(factor) || factor <= 0) return view;

  const nextW = Math.min(
    MAP_WIDTH,
    Math.max(MAP_WIDTH / MAX_ZOOM, view.w / factor),
  );
  const nextH = Math.min(
    MAP_HEIGHT,
    Math.max(MAP_HEIGHT / MAX_ZOOM, view.h / factor),
  );

  // Hit the zoom floor/ceiling - keep position stable.
  if (nextW === view.w && nextH === view.h) {
    return view;
  }

  const rx = (anchorX - view.x) / view.w;
  const ry = (anchorY - view.y) / view.h;
  return clampView({
    x: anchorX - nextW * rx,
    y: anchorY - nextH * ry,
    w: nextW,
    h: nextH,
  });
}

/** Map a pointer position on the SVG element into current view coordinates. */
export function clientToMapPoint(
  view: MapView,
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0) return null;
  const scale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT);
  const offsetX = (rect.width - MAP_WIDTH * scale) / 2;
  const offsetY = (rect.height - MAP_HEIGHT * scale) / 2;
  const svgX = (clientX - rect.left - offsetX) / scale;
  const svgY = (clientY - rect.top - offsetY) / scale;
  return {
    x: view.x + (svgX / MAP_WIDTH) * view.w,
    y: view.y + (svgY / MAP_HEIGHT) * view.h,
  };
}

/** Prefer vertical wheel deltas; ignore sideways trackpad drift. */
export function wheelZoomFactor(deltaX: number, deltaY: number): number | null {
  if (deltaY === 0) return null;
  if (Math.abs(deltaY) < Math.abs(deltaX)) return null;
  return deltaY < 0 ? 1.18 : 1 / 1.18;
}
