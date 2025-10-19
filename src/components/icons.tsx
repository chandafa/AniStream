
import type { SVGProps } from "react";

export function AniStreamLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="140"
      height="40"
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--secondary))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="10"
        y="35"
        fontFamily="'Poppins', sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#grad1)"
      >
        AniStream
      </text>
    </svg>
  );
}
