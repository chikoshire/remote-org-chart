import { toPng, toSvg } from "html-to-image";

export type ChartExportFormat = "png" | "svg";

export type ExportChartOptions = {
  /** CSS pixel ratio for raster export. */
  pixelRatio?: number;
  /** Background fill behind transparent chart chrome. */
  backgroundColor?: string;
  /** Prefer instant capture when the user wants reduced motion (no artificial delay). */
  reducedMotion?: boolean;
};

function chartViewport(root: HTMLElement): HTMLElement {
  const flow = root.querySelector(".react-flow");
  if (flow instanceof HTMLElement) return flow;
  return root;
}

/**
 * Export the visible React Flow chart to a data URL.
 * Uses the viewport transform node so pan/zoom framing is preserved.
 */
export async function exportChartDataUrl(
  root: HTMLElement,
  format: ChartExportFormat,
  options: ExportChartOptions = {},
): Promise<string> {
  const target = chartViewport(root);
  const pixelRatio = options.pixelRatio ?? 2;
  const backgroundColor = options.backgroundColor ?? "#f4f6fb";
  const filter = (node: HTMLElement) => {
    const cls =
      typeof node.className === "string"
        ? node.className
        : node.getAttribute?.("class") ?? "";
    // Omit interactive chrome that looks bad in slides.
    if (cls.includes("react-flow__controls")) return false;
    if (cls.includes("react-flow__minimap")) return false;
    if (cls.includes("react-flow__panel")) return false;
    return true;
  };

  if (format === "svg") {
    return toSvg(target, {
      cacheBust: true,
      backgroundColor,
      filter,
    });
  }

  return toPng(target, {
    cacheBust: true,
    pixelRatio,
    backgroundColor,
    filter,
  });
}

/** Trigger a browser download for a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function chartExportFilename(
  format: ChartExportFormat,
  when: Date = new Date(),
): string {
  const stamp = when.toISOString().slice(0, 10);
  return `acme-org-chart-${stamp}.${format}`;
}
