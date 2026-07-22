/** Cap Corporate / IAOS wordmark with a shield-check glyph. */
export function Logo({
  size = 32,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  const textColor = light ? "#ffffff" : "var(--navy)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
      >
        <path
          d="M20 3l14 5v9c0 9-6 15.5-14 20C12 32.5 6 26 6 17V8l14-5z"
          fill="var(--navy)"
        />
        <path
          d="M20 3l14 5v9c0 9-6 15.5-14 20V3z"
          fill="var(--navy-deep)"
        />
        <path
          d="M13.5 20.5l4.5 4.5 8.5-9"
          stroke="var(--gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.05,
        }}
      >
        <strong
          style={{
            fontSize: size * 0.5,
            letterSpacing: "0.02em",
            color: textColor,
          }}
        >
          IAOS
        </strong>
        <span
          style={{
            fontSize: size * 0.26,
            color: light ? "rgba(255,255,255,.7)" : "var(--slate)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Cap Corporate
        </span>
      </span>
    </span>
  );
}
