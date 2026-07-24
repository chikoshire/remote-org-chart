"use client";

import { useState } from "react";
import { departmentAccent } from "@/lib/ui/department-accent";
import { resolveAvatarSrc } from "@/lib/ui/avatar";

type PersonAvatarProps = {
  personId: string;
  fullName?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

function initials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

const sizeClass = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

/** Circular profile avatar: Remote photo → generated portrait → initials. */
export function PersonAvatar({
  personId,
  fullName,
  department,
  avatarUrl,
  size = "md",
  className = "",
}: PersonAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveAvatarSrc({ avatarUrl, personId, fullName });
  const accent = departmentAccent(department);

  if (failed) {
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-norma-sm ${sizeClass[size]} ${className}`}
        style={{ backgroundColor: accent }}
      >
        {initials(fullName)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/CDN avatars; next/image host allowlist varies
    <img
      src={src}
      alt=""
      aria-hidden
      width={size === "lg" ? 56 : size === "sm" ? 36 : 44}
      height={size === "lg" ? 56 : size === "sm" ? 36 : 44}
      className={`inline-block shrink-0 rounded-full bg-norma-surface-muted object-cover shadow-norma-sm ring-1 ring-norma-border/60 ${sizeClass[size]} ${className}`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
