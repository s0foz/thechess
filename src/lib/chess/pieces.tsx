// Clean, modern SVG chess pieces — minimalist geometric style.
// White pieces: solid ivory body with a subtle darker base shadow.
// Black pieces: solid charcoal body with a subtle lighter base highlight.
// Each piece uses smooth curves and a unified design language so the set
// looks cohesive and "fresh" rather than ornate/traditional.

import type { PieceColor, PieceInfo } from "@/lib/chess/engine";
import { getPieceSkin, type PieceSkinId } from "@/lib/thechess/shop";

type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

interface PieceProps {
  piece: PieceInfo;
  className?: string;
  /** Legacy prop — ignored. Pieces always fill their container. */
  size?: string | number;
  /** Skin to render. Defaults to "default" (Classic Ivory). */
  skinId?: PieceSkinId;
}

const DEFAULT_PALETTE = {
  white: {
    body: "#fafaf9",
    shade: "#d6d3d1",
    base: "#e7e5e4",
    outline: "#1c1917",
  },
  black: {
    body: "#1c1917",
    shade: "#292524",
    base: "#0c0a09",
    outline: "#0c0a09",
    highlight: "#44403c",
  },
} as const;

export function Piece({ piece, className = "", skinId = "default" }: PieceProps) {
  const isWhite = piece.color === "w";
  const skin = getPieceSkin(skinId);
  // Use the skin's palette if available, otherwise fall back to default.
  const c = skin?.palette ? skin.palette[isWhite ? "white" : "black"] : (isWhite ? DEFAULT_PALETTE.white : DEFAULT_PALETTE.black);
  const type = piece.type as PieceType;

  return (
    <svg
      viewBox="0 0 100 100"
      className={`chess-piece-svg ${className}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`${isWhite ? "white" : "black"} ${piece.type}`}
    >
      {/* Soft drop shadow under the piece */}
      <ellipse cx="50" cy="88" rx="32" ry="4" fill="rgba(0,0,0,0.18)" />

      <PieceShape type={type} c={c} isWhite={isWhite} />
    </svg>
  );
}

function PieceShape({
  type,
  c,
  isWhite,
}: {
  type: PieceType;
  c: typeof PALETTE.white;
  isWhite: boolean;
}) {
  switch (type) {
    case "p":
      return <PawnShape c={c} />;
    case "n":
      return <KnightShape c={c} isWhite={isWhite} />;
    case "b":
      return <BishopShape c={c} />;
    case "r":
      return <RookShape c={c} />;
    case "q":
      return <QueenShape c={c} />;
    case "k":
      return <KingShape c={c} />;
  }
}

// Shared base renderer — a rounded pedestal that all pieces sit on.
function Base({ c }: { c: typeof PALETTE.white }) {
  return (
    <>
      {/* Bottom disc — slightly wider */}
      <ellipse cx="50" cy="84" rx="30" ry="5" fill={c.base} />
      {/* Middle disc */}
      <ellipse cx="50" cy="78" rx="24" ry="4.5" fill={c.body} />
      {/* Stem */}
      <path
        d="M 32 78 L 36 70 L 64 70 L 68 78 Z"
        fill={c.body}
      />
    </>
  );
}

function PawnShape({ c }: { c: typeof PALETTE.white }) {
  return (
    <g>
      <Base c={c} />
      {/* Body — a smooth bell shape */}
      <path
        d="M 40 70 C 38 60, 36 52, 40 46 C 42 42, 46 41, 46 38 L 46 33 C 42 31, 41 26, 44 22 C 47 18, 53 18, 56 22 C 59 26, 58 31, 54 33 L 54 38 C 54 41, 58 42, 60 46 C 64 52, 62 60, 60 70 Z"
        fill={c.body}
      />
      {/* Head highlight */}
      <ellipse cx="47" cy="24" rx="2" ry="1.5" fill={c.bodyShade} opacity="0.5" />
    </g>
  );
}

function KnightShape({ c, isWhite }: { c: typeof PALETTE.white; isWhite: boolean }) {
  // The knight is the most distinctive piece — a stylized horse head.
  return (
    <g>
      <Base c={c} />
      {/* Main horse-head silhouette */}
      <path
        d="M 36 70 L 38 56 C 38 50, 36 46, 32 44 L 28 41 C 26 39, 27 36, 30 36 L 35 36 C 38 34, 40 32, 42 28 L 44 22 C 46 18, 50 17, 54 18 C 60 20, 66 24, 68 32 L 70 44 L 68 58 L 64 70 Z"
        fill={c.body}
      />
      {/* Mane — a swept-back ridge */}
      <path
        d="M 44 22 C 46 26, 48 30, 50 34 L 52 30 C 50 26, 48 22, 46 19 Z"
        fill={c.bodyShade}
        opacity="0.6"
      />
      <path
        d="M 48 26 C 50 30, 52 34, 54 38 L 56 34 C 54 30, 52 26, 50 23 Z"
        fill={c.bodyShade}
        opacity="0.5"
      />
      {/* Eye — a small dot */}
      <circle cx="58" cy="30" r="2" fill={isWhite ? c.outline : "#f5f5f4"} />
      {/* Ear notch */}
      <path
        d="M 64 24 L 67 20 L 69 26 Z"
        fill={c.bodyShade}
      />
      {/* Mouth/snout line */}
      <path
        d="M 66 38 L 70 38"
        stroke={c.bodyShade}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </g>
  );
}

function BishopShape({ c }: { c: typeof PALETTE.white }) {
  return (
    <g>
      <Base c={c} />
      {/* Body — tall rounded shape */}
      <path
        d="M 42 70 C 40 60, 38 52, 40 44 C 42 38, 46 35, 46 30 L 46 26 L 54 26 L 54 30 C 54 35, 58 38, 60 44 C 62 52, 60 60, 58 70 Z"
        fill={c.body}
      />
      {/* Top finial */}
      <circle cx="50" cy="20" r="3.5" fill={c.body} />
      {/* Mitre slit */}
      <path
        d="M 50 28 L 50 36"
        stroke={c.bodyShade}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Collar ring */}
      <ellipse cx="50" cy="42" rx="10" ry="2" fill={c.bodyShade} opacity="0.4" />
    </g>
  );
}

function RookShape({ c }: { c: typeof PALETTE.white }) {
  return (
    <g>
      <Base c={c} />
      {/* Body — rectangular tower */}
      <path
        d="M 42 70 L 42 44 L 40 42 L 40 34 L 60 34 L 60 42 L 58 44 L 58 70 Z"
        fill={c.body}
      />
      {/* Crenellations — three notches on top */}
      <path
        d="M 38 34 L 38 28 L 44 28 L 44 34 M 47 34 L 47 28 L 53 28 L 53 34 M 56 34 L 56 28 L 62 28 L 62 34"
        fill={c.body}
      />
      {/* Top band detail */}
      <rect x="38" y="38" width="24" height="2.5" fill={c.bodyShade} opacity="0.5" />
      {/* Mid band detail */}
      <rect x="40" y="56" width="20" height="2" fill={c.bodyShade} opacity="0.4" />
    </g>
  );
}

function QueenShape({ c }: { c: typeof PALETTE.white }) {
  return (
    <g>
      <Base c={c} />
      {/* Body — wide bell */}
      <path
        d="M 38 70 C 36 58, 34 50, 38 42 L 42 38 L 58 38 L 62 42 C 66 50, 64 58, 62 70 Z"
        fill={c.body}
      />
      {/* Crown — scalloped top */}
      <path
        d="M 38 38 L 34 26 L 40 32 L 44 22 L 50 30 L 56 22 L 60 32 L 66 26 L 62 38 Z"
        fill={c.body}
      />
      {/* Crown jewels — small dots on each point */}
      <circle cx="34" cy="26" r="1.8" fill={c.bodyShade} />
      <circle cx="44" cy="22" r="1.8" fill={c.bodyShade} />
      <circle cx="50" cy="20" r="2" fill={c.bodyShade} />
      <circle cx="56" cy="22" r="1.8" fill={c.bodyShade} />
      <circle cx="66" cy="26" r="1.8" fill={c.bodyShade} />
      {/* Collar ring */}
      <ellipse cx="50" cy="44" rx="12" ry="2" fill={c.bodyShade} opacity="0.4" />
    </g>
  );
}

function KingShape({ c }: { c: typeof PALETTE.white }) {
  return (
    <g>
      <Base c={c} />
      {/* Body — wide bell */}
      <path
        d="M 38 70 C 36 58, 34 50, 38 42 L 42 38 L 58 38 L 62 42 C 66 50, 64 58, 62 70 Z"
        fill={c.body}
      />
      {/* Crown — flat top with central cross */}
      <path
        d="M 38 38 L 38 28 L 62 28 L 62 38 Z"
        fill={c.body}
      />
      {/* Crenellations */}
      <path
        d="M 38 28 L 38 22 L 44 22 L 44 28 M 56 28 L 56 22 L 62 22 L 62 28"
        fill={c.body}
      />
      {/* Cross */}
      <rect x="48" y="14" width="4" height="14" fill={c.body} />
      <rect x="44" y="18" width="12" height="3.5" fill={c.body} />
      {/* Collar ring */}
      <ellipse cx="50" cy="44" rx="12" ry="2" fill={c.bodyShade} opacity="0.4" />
    </g>
  );
}

// Backward-compat helpers
export function pieceGlyph(piece: PieceInfo): string {
  const PIECE_UNICODE: Record<string, string> = {
    k: "\u265A",
    q: "\u265B",
    r: "\u265C",
    b: "\u265D",
    n: "\u265E",
    p: "\u265F",
  };
  return PIECE_UNICODE[piece.type] ?? "";
}

export function pieceLabel(piece: PieceInfo): string {
  const names: Record<string, string> = {
    k: "King",
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
    p: "Pawn",
  };
  return `${piece.color === "w" ? "White" : "Black"} ${names[piece.type]}`;
}

export function colorLabel(color: PieceColor): string {
  return color === "w" ? "White" : "Black";
}
