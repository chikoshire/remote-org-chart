"use client";

import { useState } from "react";
import { departmentAccent } from "@/lib/ui/department-accent";
import { resolveAvatarSrc } from "@/lib/ui/avatar";
import { personAvatarMorphName } from "@/lib/ui/motion";

type PersonAvatarProps = {
  personId: string;
  fullName?: string | null;
  department?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** When true, this avatar owns the shared-element morph for the person. */
  morph?: boolean;
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
  xl: "h-24 w-24 text-2xl md:h-28 md:w-28 md:text-3xl",
} as const;

function InitialsAvatar({
  fullName,
  department,
  size,
  className,
  morph,
  personId,
}: {
  fullName?: string | null;
  department?: string | null;
  size: "sm" | "md" | "lg" | "xl";
  className: string;
  morph?: boolean;
  personId: string;
}) {
  const accent = departmentAccent(department);
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-norma-sm ring-1 ring-black/5 ${sizeClass[size]} ${className}`}
      style={{
        backgroundColor: accent,
        ...(morph
          ? { viewTransitionName: personAvatarMorphName(personId) }
          : undefined),
      }}
      data-morph-avatar={morph ? personId : undefined}
    >
      {initials(fullName)}
    </span>
  );
}

/**
 * Circular profile avatar.
 * Initials use department accent colour; photos keep a department-coloured ring.
 */
export function PersonAvatar({
  personId,
  fullName,
  department,
  avatarUrl,
  size = "md",
  className = "",
  morph = false,
}: PersonAvatarProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveAvatarSrc({ avatarUrl });
  const px = size === "xl" ? 112 : size === "lg" ? 56 : size === "sm" ? 36 : 44;
  const accent = departmentAccent(department);

  if (!src || failed) {
    return (
      <InitialsAvatar
        personId={personId}
        fullName={fullName}
        department={department}
        size={size}
        className={className}
        morph={morph}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Remote CDN URLs; host allowlist varies
    <img
      src={src}
      alt=""
      aria-hidden
      width={px}
      height={px}
      className={`inline-block shrink-0 rounded-full bg-norma-surface-muted object-cover shadow-norma-sm ${sizeClass[size]} ${className}`}
      style={{
        boxShadow: `0 0 0 2px ${accent}`,
        ...(morph
          ? { viewTransitionName: personAvatarMorphName(personId) }
          : undefined),
      }}
      data-morph-avatar={morph ? personId : undefined}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
