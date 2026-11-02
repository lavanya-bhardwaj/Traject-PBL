// Brand mark: an upward arrow built from two strokes, in the primary colour.
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b3df5" />
          <stop offset="1" stopColor="#c026d3" />
        </linearGradient>
      </defs>
      <path
        d="M6 26 L18 14 M10 8 H26 V24"
        fill="none"
        stroke="url(#logo-grad)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
