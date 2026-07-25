import type { ReactNode } from "react";
import { createElement, Fragment } from "react";
import { HelpShot } from "@/components/help/HelpShot";
import { getHelpShot } from "@/lib/help/shots";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0]!;
    if (token.startsWith("**")) {
      nodes.push(
        createElement("strong", { key: `${keyPrefix}-b-${i++}` }, token.slice(2, -2)),
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        createElement(
          "code",
          {
            key: `${keyPrefix}-c-${i++}`,
            className: "rounded bg-norma-surface-muted px-1 py-0.5 text-[0.85em]",
          },
          token.slice(1, -1),
        ),
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (link) {
        nodes.push(
          createElement(
            "a",
            {
              key: `${keyPrefix}-a-${i++}`,
              href: link[2],
              className: "font-medium text-norma-royal underline-offset-2 hover:underline",
            },
            link[1],
          ),
        );
      }
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

const SHOT_RE = /^\{\{shot:([a-z0-9-]+)\}\}$/i;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;

/**
 * Lightweight markdown → React for Help pages (headings, lists, tables, shots, images).
 */
export function renderHelpMarkdown(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    const shotMatch = SHOT_RE.exec(line.trim());
    if (shotMatch) {
      const shot = getHelpShot(shotMatch[1]!);
      if (shot) {
        blocks.push(createElement(HelpShot, { key: key++, ...shot }));
      }
      i += 1;
      continue;
    }

    const imageMatch = IMAGE_RE.exec(line.trim());
    if (imageMatch) {
      blocks.push(
        createElement(HelpShot, {
          key: key++,
          src: imageMatch[2]!,
          alt: imageMatch[1] || "Help screenshot",
          lead: imageMatch[3],
        }),
      );
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        createElement(
          "h1",
          {
            key: key++,
            className:
              "font-[family-name:var(--font-norma-display)] text-2xl font-semibold tracking-tight text-norma-ink md:text-3xl",
          },
          inline(line.slice(2), `h1-${key}`),
        ),
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(
        createElement(
          "h2",
          {
            key: key++,
            className: "mt-8 text-lg font-semibold text-norma-prussian",
          },
          inline(line.slice(3), `h2-${key}`),
        ),
      );
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(
        createElement(
          "h3",
          {
            key: key++,
            className: "mt-6 text-base font-semibold text-norma-ink",
          },
          inline(line.slice(4), `h3-${key}`),
        ),
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i]?.trim().startsWith("|")) {
        const raw = lines[i]!;
        if (!raw.includes("---")) {
          rows.push(
            raw
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim()),
          );
        }
        i += 1;
      }
      if (rows.length > 0) {
        const [header, ...body] = rows;
        blocks.push(
          createElement(
            "div",
            {
              key: key++,
              className: "mt-4 overflow-x-auto rounded-norma-md border border-norma-border",
            },
            createElement(
              "table",
              { className: "w-full min-w-[20rem] text-left text-sm" },
              createElement(
                "thead",
                { className: "bg-norma-surface-muted/80" },
                createElement(
                  "tr",
                  null,
                  header!.map((cell, ci) =>
                    createElement(
                      "th",
                      {
                        key: ci,
                        className: "px-3 py-2 font-semibold text-norma-ink",
                      },
                      inline(cell, `th-${key}-${ci}`),
                    ),
                  ),
                ),
              ),
              createElement(
                "tbody",
                null,
                body.map((row, ri) =>
                  createElement(
                    "tr",
                    {
                      key: ri,
                      className: "border-t border-norma-border/70",
                    },
                    row.map((cell, ci) =>
                      createElement(
                        "td",
                        {
                          key: ci,
                          className: "px-3 py-2 text-norma-ink-muted",
                        },
                        inline(cell, `td-${key}-${ri}-${ci}`),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }
      continue;
    }

    if (/^[-*] /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^[-*] /, ""));
        i += 1;
      }
      blocks.push(
        createElement(
          "ul",
          {
            key: key++,
            className: "mt-3 list-disc space-y-1.5 pl-5 text-sm text-norma-ink-muted",
          },
          items.map((item, ii) =>
            createElement("li", { key: ii }, inline(item, `li-${key}-${ii}`)),
          ),
        ),
      );
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !(lines[i] ?? "").startsWith("#") &&
      !(lines[i] ?? "").trim().startsWith("|") &&
      !/^[-*] /.test((lines[i] ?? "").trim()) &&
      !SHOT_RE.test((lines[i] ?? "").trim()) &&
      !IMAGE_RE.test((lines[i] ?? "").trim())
    ) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    blocks.push(
      createElement(
        "p",
        {
          key: key++,
          className: "mt-3 text-sm leading-relaxed text-norma-ink-muted",
        },
        inline(para.join(" "), `p-${key}`),
      ),
    );
  }

  return createElement(Fragment, null, ...blocks);
}
