/**
 * Official Remote mark - the chunky lowercase “r” from remote.com’s
 * `remote-logo.svg` wordmark (Contentstack). Black monochrome for product UI.
 */
export function RemoteMark({
  className = "h-6 w-auto",
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
      width={29}
      height={40}
      className={className}
      decoding="async"
    />
  );
}
