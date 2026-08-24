import type { PieceColor, PieceInfo } from "@/lib/chess/engine";

// We use the FILLED Unicode variants for both colors so shapes are identical.
// CSS controls actual color/outline so white pieces read as white on dark squares
// and black pieces read as black on light squares.
const PIECE_UNICODE: Record<string, string> = {
  k: "\u265A", // ♚ black king (filled)
  q: "\u265B", // ♛ black queen (filled)
  r: "\u265C", // ♜ black rook (filled)
  b: "\u265D", // ♝ black bishop (filled)
  n: "\u265E", // ♞ black knight (filled)
  p: "\u265F", // ♟ black pawn (filled)
};

export function pieceGlyph(piece: PieceInfo): string {
  return PIECE_UNICODE[piece.type] ?? "";
}

export function Piece({
  piece,
  size = "100%",
  className = "",
}: {
  piece: PieceInfo;
  size?: string | number;
  className?: string;
}) {
  const isWhite = piece.color === "w";
  return (
    <span
      aria-label={`${isWhite ? "white" : "black"} ${piece.type}`}
      role="img"
      className={`chess-piece select-none leading-none ${isWhite ? "is-white" : "is-black"} ${className}`}
      style={{
        fontSize: typeof size === "number" ? `${size}px` : size,
      }}
    >
      {PIECE_UNICODE[piece.type]}
    </span>
  );
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
