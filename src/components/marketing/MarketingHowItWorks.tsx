"use client";

import { useState } from "react";
import { MarketingAppShot } from "@/components/marketing/MarketingAppShot";

const FEATURES = [
  {
    id: "chart",
    title: "Org chart",
    body: "Pan, zoom, and compare reporting lines on the live employment graph from Remote.",
    src: "/marketing/hero-org-chart.png",
    alt: "Acme org chart showing managers and direct reports",
  },
  {
    id: "tree",
    title: "Reporting tree",
    body: "Walk the hierarchy left to right. Expand or collapse any branch without losing place.",
    src: "/marketing/app-tree.png",
    alt: "Acme reporting tree view",
  },
  {
    id: "map",
    title: "World map",
    body: "See where people sit by country, then open the same people from the chart or directory.",
    src: "/marketing/app-map.png",
    alt: "Acme world map of headcount by country",
  },
  {
    id: "people",
    title: "People directory",
    body: "Search the roster, open profiles, and surface incomplete title, department, or country fields.",
    src: "/marketing/app-people.png",
    alt: "Acme people directory",
  },
  {
    id: "dashboard",
    title: "Dashboard & data health",
    body: "Headcount, departments, completeness, and country distribution in one glance.",
    src: "/marketing/app-dashboard.png",
    alt: "Acme dashboard with KPIs and charts",
  },
] as const;

/**
 * remote.com “How we do it” pattern: accordion list + live product panel.
 */
export function MarketingHowItWorks() {
  const [active, setActive] = useState<(typeof FEATURES)[number]["id"]>("chart");
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0]!;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-14">
      <ul className="divide-y divide-norma-border border-y border-norma-border">
        {FEATURES.map((feature) => {
          const open = feature.id === active;
          return (
            <li key={feature.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(feature.id)}
                className={`flex w-full flex-col gap-2 px-1 py-5 text-left transition ${
                  open
                    ? "bg-norma-ink text-norma-ink-inverse"
                    : "hover:bg-norma-lavender/30"
                }`}
              >
                <span
                  className={`px-4 font-[family-name:var(--font-norma-display)] text-lg md:text-xl ${
                    open ? "text-norma-ink-inverse" : "text-norma-ink"
                  }`}
                >
                  {feature.title}
                </span>
                {open ? (
                  <span className="px-4 pb-2 text-sm leading-relaxed text-white/75">
                    {feature.body}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="marketing-reveal is-visible lg:sticky lg:top-28">
        <MarketingAppShot
          key={current.src}
          src={current.src}
          alt={current.alt}
          className="marketing-feature-shot"
        />
      </div>
    </div>
  );
}
