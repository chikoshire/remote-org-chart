/**
 * Soft mesh + film grain atmosphere inspired by remote.com’s homepage washes.
 * Pure CSS — no third-party brand assets.
 */
export function MarketingAtmosphere({
  variant = "top",
}: {
  variant?: "top" | "bottom" | "band";
}) {
  const mesh =
    variant === "bottom"
      ? "radial-gradient(ellipse 90% 70% at 20% 100%, rgb(216 240 230 / 0.85) 0%, transparent 55%), radial-gradient(ellipse 70% 55% at 90% 80%, rgb(217 235 248 / 0.7) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 50% 60%, rgb(232 224 245 / 0.45) 0%, transparent 45%)"
      : variant === "band"
        ? "radial-gradient(ellipse 80% 120% at 10% 50%, rgb(232 224 245 / 0.9) 0%, transparent 50%), radial-gradient(ellipse 70% 100% at 90% 40%, rgb(255 232 204 / 0.75) 0%, transparent 48%), linear-gradient(180deg, rgb(244 241 235 / 0.2), rgb(216 240 230 / 0.35))"
        : "radial-gradient(ellipse 85% 65% at 78% 8%, rgb(232 224 245 / 0.8) 0%, transparent 52%), radial-gradient(ellipse 55% 45% at 8% 0%, rgb(255 232 204 / 0.65) 0%, transparent 48%), radial-gradient(ellipse 40% 35% at 55% 25%, rgb(217 235 248 / 0.55) 0%, transparent 50%)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundImage: mesh }} />
      <div className="marketing-grain absolute inset-0 opacity-[0.35]" />
      {variant === "top" ? (
        <div className="marketing-orb marketing-orb-a absolute -right-[12%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-norma-lavender/50 blur-3xl" />
      ) : null}
      {variant === "top" ? (
        <div className="marketing-orb marketing-orb-b absolute -left-[8%] top-[28%] h-[22rem] w-[22rem] rounded-full bg-norma-peach/45 blur-3xl" />
      ) : null}
    </div>
  );
}
