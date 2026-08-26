"use client";

// New thechess logo — a modern, geometric knight-head silhouette rendered as
// SVG with an emerald-to-amber gradient. Maintains the original chess-knight
// theme but feels more "game-y" with a glow + 3D bevel.

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, withWordmark = false, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-base font-bold lowercase tracking-tight text-transparent"
          style={{ fontSize: size * 0.5 }}
        >
          thechess
        </span>
      )}
    </div>
  );
}

export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  const id = `logo-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="thechess logo"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#064e3b" />
          <stop offset="0.5" stopColor="#0f172a" />
          <stop offset="1" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id={`${id}-knight`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rounded-square dark background */}
      <rect width="48" height="48" rx="10" fill={`url(#${id}-bg)`} />
      {/* Subtle inner highlight */}
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="9"
        fill="none"
        stroke="white"
        strokeOpacity="0.08"
        strokeWidth="1"
      />

      {/* Stylized knight head silhouette — geometric & modern */}
      <g filter={`url(#${id}-glow)`}>
        <path
          d="M14 38 L14 32 C14 28 16 25.5 18.5 24 C19.5 23.4 19.5 22 18.5 21.4 C16.5 20 15 18 15 16 C15 14 16 12.5 17.5 11.5 L22 8.5 C23.5 7.5 25.5 7 27.5 7.5 C30 8 32 9.5 33.5 11.5 L36.5 16 C37.5 17.5 38 19.5 38 21.5 L38 32 C38 35 36 38 33 38 L14 38 Z"
          fill={`url(#${id}-knight)`}
        />
        {/* Mane ridge */}
        <path
          d="M22 9 L20 14 L22 13 L21 17 L23 16 L22.5 20 L25 18.5 L25 22"
          stroke="#059669"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.55"
        />
        {/* Eye */}
        <circle cx="28" cy="16" r="1.4" fill="#0f172a" />
        {/* Base / pedestal */}
        <rect x="12" y="38" width="26" height="3" rx="1.5" fill="#fde68a" opacity="0.85" />
      </g>
    </svg>
  );
}
