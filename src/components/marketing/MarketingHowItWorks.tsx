"use client";

import { useState, type ReactNode } from "react";
import { MarketingAppShot } from "@/components/marketing/MarketingAppShot";

function IconChart() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19h16M7 16V9m5 7V5m5 11v-4"
      />
    </svg>
  );
}

function IconTree() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v6m0 0 5 5m-5-5-5 5M7 20h10"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2v-13Z"
      />
      <path strokeLinecap="round" d="M9 4.5v13M15 6.5v13" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />
      <circle cx="9" cy="7" r="3.5" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.35M16.5 3.6a3.5 3.5 0 0 1 0 6.8"
      />
    </svg>
  );
}

function IconDash() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const FEATURES: {
  id: "chart" | "tree" | "map" | "people" | "dashboard";
  title: string;
  body: string;
  src: string;
  alt: string;
  tone: string;
  iconBg: string;
  icon: ReactNode;
}[] = [
  {
    id: "chart",
    title: "Org chart",
    body: "Pan, zoom, and compare reporting lines on the live employment graph.",
    src: "/marketing/hero-org-chart.png",
    alt: "Acme org chart showing managers and direct reports",
    tone: "from-norma-peach/90 to-norma-peach/50",
    iconBg: "bg-norma-peach",
    icon: <IconChart />,
  },
  {
    id: "tree",
    title: "Reporting tree",
    body: "Walk the hierarchy left to right. Expand or collapse any branch without losing place.",
    src: "/marketing/app-tree.png",
    alt: "Acme reporting tree view",
    tone: "from-norma-lavender/90 to-norma-lavender/50",
    iconBg: "bg-norma-lavender",
    icon: <IconTree />,
  },
  {
    id: "map",
    title: "World map",
    body: "See where people sit by country, then open the same people from the chart or directory.",
    src: "/marketing/app-map.png",
    alt: "Acme world map of headcount by country",
    tone: "from-norma-sky/90 to-norma-sky/50",
    iconBg: "bg-norma-sky",
    icon: <IconMap />,
  },
  {
    id: "people",
    title: "People directory",
    body: "Search the roster, open profiles, and surface incomplete title, department, or country fields.",
    src: "/marketing/app-people.png",
    alt: "Acme people directory",
    tone: "from-norma-mint/90 to-norma-mint/50",
    iconBg: "bg-norma-mint",
    icon: <IconPeople />,
  },
  {
    id: "dashboard",
    title: "Dashboard & data health",
    body: "Headcount, departments, completeness, and country distribution in one glance.",
    src: "/marketing/app-dashboard.png",
    alt: "Acme dashboard with KPIs and charts",
    tone: "from-norma-rose/90 to-norma-rose/50",
    iconBg: "bg-norma-rose",
    icon: <IconDash />,
  },
];

/**
 * remote.com “How we do it” pattern: accordion list + live product panel.
 */
export function MarketingHowItWorks() {
  const [active, setActive] = useState<(typeof FEATURES)[number]["id"]>("chart");
  const current = FEATURES.find((f) => f.id === active) ?? FEATURES[0]!;

  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start lg:gap-16">
      <ul className="flex flex-col gap-3">
        {FEATURES.map((feature) => {
          const open = feature.id === active;
          return (
            <li key={feature.id}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setActive(feature.id)}
                className={`flex w-full cursor-pointer flex-col gap-3 rounded-[1.35rem] px-5 py-5 text-left transition duration-200 md:px-6 md:py-6 ${
                  open
                    ? `bg-gradient-to-br ${feature.tone} text-norma-ink shadow-norma-md ring-1 ring-black/5`
                    : "bg-norma-canvas/80 text-norma-ink hover:bg-norma-lavender/35"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${feature.iconBg} text-norma-ink shadow-norma-sm`}
                  >
                    {feature.icon}
                  </span>
                  <span className="font-[family-name:var(--font-norma-display)] text-xl tracking-tight md:text-2xl">
                    {feature.title}
                  </span>
                </span>
                {open ? (
                  <span className="pl-[3.6rem] text-base leading-relaxed text-norma-ink/75 md:text-[1.05rem]">
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
