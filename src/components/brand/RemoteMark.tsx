/**
 * Official Remote mark (sourced from remote.com Contentstack assets).
 * Trademark belongs to Remote — used here only to label the Remote integration.
 */
export function RemoteMark({
  className = "h-5 w-5",
  title = "Remote",
}: {
  className?: string;
  title?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local SVG brand asset
    <img
      src="/brand/remote-mark.svg"
      alt={title}
      width={20}
      height={20}
      className={className}
      decoding="async"
    />
  );
}
