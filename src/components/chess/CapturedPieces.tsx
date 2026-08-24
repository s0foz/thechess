"use client";

import { Piece } from "@/lib/chess/pieces";
import type { PieceColor } from "@/lib/chess/engine";
import { PIECE_VALUES } from "@/lib/chess/engine";

interface CapturedPiecesProps {
  capturedByWhite: Array<"p" | "n" | "b" | "r" | "q" | "k">;
  capturedByBlack: Array<"p" | "n" | "b" | "r" | "q" | "k">;
  perspective: PieceColor; // which color is "us" at the bottom
}

// Sort captured pieces by descending value for stable display.
const PIECE_ORDER: Array<"q" | "r" | "b" | "n" | "p"> = ["q", "r", "b", "n", "p"];

function sortCaptured(list: Array<"p" | "n" | "b" | "r" | "q" | "k">) {
  return [...list].sort((a, b) => PIECE_ORDER.indexOf(a as "q") - PIECE_ORDER.indexOf(b as "q"));
}

function materialDiff(
  capturedByWhite: Array<"p" | "n" | "b" | "r" | "q" | "k">,
  capturedByBlack: Array<"p" | "n" | "b" | "r" | "q" | "k">,
): { whiteAdvantage: number; blackAdvantage: number } {
  let white = 0;
  let black = 0;
  for (const p of capturedByWhite) white += PIECE_VALUES[p];
  for (const p of capturedByBlack) black += PIECE_VALUES[p];
  if (white > black) return { whiteAdvantage: white - black, blackAdvantage: 0 };
  return { whiteAdvantage: 0, blackAdvantage: black - white };
}

export function CapturedPieces({
  capturedByWhite,
  capturedByBlack,
  perspective,
}: CapturedPiecesProps) {
  const { whiteAdvantage, blackAdvantage } = materialDiff(capturedByWhite, capturedByBlack);

  // Pieces captured BY white are black pieces. Pieces captured BY black are white pieces.
  // Display from the perspective of the player at the bottom: their captures on top.
  const isWhitePerspective = perspective === "w";

  const topCaptured = isWhitePerspective ? capturedByBlack : capturedByWhite;
  const topColor: PieceColor = isWhitePerspective ? "w" : "b"; // pieces captured by the bottom player are the OPPONENT's pieces
  // Wait: top of the board shows the OPPONENT. The opponent is whoever is NOT the bottom player.
  // The opponent's captures (pieces they've taken from us) are shown above them.
  // Actually the convention is: each side shows the pieces they have CAPTURED (i.e., the enemy pieces they took).

  const opponentColor: PieceColor = isWhitePerspective ? "b" : "w";
  const myColor: PieceColor = isWhitePerspective ? "w" : "b";

  // Opponent's captures = pieces opponent took = OUR color pieces.
  // My captures = pieces I took = OPPONENT color pieces.
  const opponentCaptured = opponentColor === "w" ? capturedByBlack : capturedByWhite;
  const myCaptured = myColor === "w" ? capturedByWhite : capturedByBlack;
  const opponentCapturedColor: PieceColor = myColor; // pieces taken from me are my color
  const myCapturedColor: PieceColor = opponentColor; // pieces I took are opponent's color

  const myAdvantage = myColor === "w" ? whiteAdvantage : blackAdvantage;
  const opponentAdvantage = opponentColor === "w" ? whiteAdvantage : blackAdvantage;

  return (
    <div className="flex flex-col gap-1">
      {/* Opponent's captures (top) */}
      <div className="flex min-h-[28px] items-center gap-1 px-1">
        <CapturedRow
          pieces={sortCaptured(opponentCaptured)}
          color={opponentCapturedColor}
          advantage={opponentAdvantage}
        />
      </div>
      {/* My captures (bottom) */}
      <div className="flex min-h-[28px] items-center gap-1 px-1">
        <CapturedRow
          pieces={sortCaptured(myCaptured)}
          color={myCapturedColor}
          advantage={myAdvantage}
        />
      </div>
    </div>
  );
}

function CapturedRow({
  pieces,
  color,
  advantage,
}: {
  pieces: Array<"p" | "n" | "b" | "r" | "q" | "k">;
  color: PieceColor;
  advantage: number;
}) {
  return (
    <>
      <div className="flex flex-1 flex-wrap items-center">
        {pieces.length === 0 ? (
          <span className="text-[10px] text-muted-foreground">—</span>
        ) : (
          pieces.map((p, i) => (
            <span
              key={`${p}-${i}`}
              className="-ml-1 first:ml-0"
              style={{ fontSize: "18px", lineHeight: 1 }}
            >
              <Piece piece={{ type: p, color }} size={18} />
            </span>
          ))
        )}
      </div>
      {advantage > 0 && (
        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
          +{advantage}
        </span>
      )}
    </>
  );
}
