"use client";

import { Fragment, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import type { EngineSnapshot, PieceColor } from "@/lib/chess/engine";
import { Piece } from "@/lib/chess/pieces";

interface ChessBoardProps {
  snapshot: EngineSnapshot;
  orientation: PieceColor;
  interactive: boolean;
  onMove: (from: Square, to: Square) => void;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

function squareToCoords(sq: string): { row: number; col: number } {
  const file = sq.charCodeAt(0) - "a".charCodeAt(0);
  const rank = parseInt(sq[1] ?? "0", 10);
  return { row: 8 - rank, col: file };
}

function coordsToSquare(row: number, col: number): string {
  return `${FILES[col]}${8 - row}`;
}

export function ChessBoard({
  snapshot,
  orientation,
  interactive,
  onMove,
}: ChessBoardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [prevFen, setPrevFen] = useState<string>(snapshot.fen);

  const visualRows = orientation === "w" ? RANKS : [...RANKS].reverse();
  const visualCols = orientation === "w" ? FILES : [...FILES].reverse();

  const getLogical = (visualRowIdx: number, visualColIdx: number) => {
    const rank = visualRows[visualRowIdx];
    const file = visualCols[visualColIdx];
    const logicalRow = 8 - rank;
    const logicalCol = file.charCodeAt(0) - "a".charCodeAt(0);
    return { logicalRow, logicalCol };
  };

  // Reset selection when fen changes (i.e., after a move).
  // This is the React "adjust state during render" pattern.
  if (prevFen !== snapshot.fen) {
    setPrevFen(snapshot.fen);
    if (selected !== null) setSelected(null);
  }

  // Legal targets are a pure function of `selected` + `snapshot.fen`.
  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    try {
      const chess = new Chess(snapshot.fen);
      const moves = chess.moves({ square: selected as Square, verbose: true });
      const set = new Set<string>();
      for (const m of moves) set.add(m.to);
      return set;
    } catch {
      return new Set<string>();
    }
  }, [selected, snapshot.fen]);

  const lastMoveFrom = snapshot.lastMove?.from ?? null;
  const lastMoveTo = snapshot.lastMove?.to ?? null;
  const checkSquare = snapshot.checkSquare;

  const isGameOver = useMemo(
    () =>
      snapshot.status === "checkmate" ||
      snapshot.status === "stalemate" ||
      snapshot.status === "draw" ||
      snapshot.status === "threefold" ||
      snapshot.status === "insufficient" ||
      snapshot.status === "fifty-move",
    [snapshot.status],
  );

  const handleSquareClick = (square: string) => {
    if (!interactive) return;

    if (selected) {
      if (selected === square) {
        setSelected(null);
        return;
      }
      if (legalTargets.has(square)) {
        onMove(selected as Square, square as Square);
        setSelected(null);
        return;
      }
      const coords = squareToCoords(square);
      const piece = snapshot.board[coords.row][coords.col];
      if (piece && piece.color === snapshot.turn) {
        setSelected(square);
        return;
      }
      setSelected(null);
      return;
    }

    const coords = squareToCoords(square);
    const piece = snapshot.board[coords.row][coords.col];
    if (piece && piece.color === snapshot.turn) {
      setSelected(square);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: string) => {
    if (!interactive) return;
    const coords = squareToCoords(square);
    const piece = snapshot.board[coords.row][coords.col];
    if (!piece || piece.color !== snapshot.turn) {
      e.preventDefault();
      return;
    }
    setSelected(square);
    e.dataTransfer.setData("text/plain", square);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, square: string) => {
    if (!interactive || !selected) return;
    if (!legalTargets.has(square)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(square);
  };

  const handleDrop = (e: React.DragEvent, square: string) => {
    e.preventDefault();
    setDragOver(null);
    const from = e.dataTransfer.getData("text/plain") as Square;
    if (from && legalTargets.has(square)) {
      onMove(from, square as Square);
      setSelected(null);
    }
  };

  return (
    <div className="chess-board-wrap inline-block w-full select-none rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 p-2 shadow-2xl ring-1 ring-black/40 sm:p-3">
      <div className="grid w-full grid-cols-[1.2em_repeat(8,1fr)_1.2em] grid-rows-[1.2em_repeat(8,1fr)_1.2em] gap-0">
        <div />
        {visualCols.map((f) => (
          <div
            key={`top-file-${f}`}
            className="flex items-end justify-center pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-xs"
          >
            {f}
          </div>
        ))}
        <div />

        {Array.from({ length: 8 }).map((_, visualRowIdx) => (
          <Fragment key={`row-${visualRowIdx}`}>
            <div className="flex items-center justify-center pr-1 text-[10px] font-semibold text-zinc-400 sm:text-xs">
              {visualRows[visualRowIdx]}
            </div>

            {Array.from({ length: 8 }).map((_, visualColIdx) => {
              const { logicalRow, logicalCol } = getLogical(visualRowIdx, visualColIdx);
              const square = coordsToSquare(logicalRow, logicalCol);
              const piece = snapshot.board[logicalRow][logicalCol];
              const isLight = (logicalRow + logicalCol) % 2 === 0;
              const isSelected = selected === square;
              const isLegalTarget = legalTargets.has(square);
              const isCapture = isLegalTarget && !!piece;
              const isLastFrom = lastMoveFrom === square;
              const isLastTo = lastMoveTo === square;
              const isCheck = checkSquare === square;
              const isDragOver = dragOver === square;

              return (
                <div
                  key={square}
                  className={[
                    "chess-square relative flex aspect-square w-full items-center justify-center",
                    "cursor-pointer transition-colors duration-100",
                    isLight ? "bg-amber-100" : "bg-amber-800",
                    isDragOver ? "ring-2 ring-inset ring-emerald-400" : "",
                  ].join(" ")}
                  data-square={square}
                  onClick={() => handleSquareClick(square)}
                  onDragOver={(e) => handleDragOver(e, square)}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(e, square)}
                >
                  {(isLastFrom || isLastTo) && (
                    <span className="pointer-events-none absolute inset-0 bg-yellow-300/50" />
                  )}
                  {isSelected && (
                    <span className="pointer-events-none absolute inset-0 bg-emerald-400/60 ring-2 ring-inset ring-emerald-500" />
                  )}
                  {isCheck && (
                    <span className="pointer-events-none absolute inset-0 bg-red-500/70 ring-2 ring-inset ring-red-600" />
                  )}
                  {isDragOver && (
                    <span className="pointer-events-none absolute inset-0 bg-emerald-300/40 ring-2 ring-inset ring-emerald-500" />
                  )}
                  {piece && (
                    <div
                      className="draggable-piece pointer-events-auto flex h-[88%] w-[88%] cursor-grab items-center justify-center active:cursor-grabbing"
                      draggable={!isGameOver && interactive && piece.color === snapshot.turn}
                      onDragStart={(e) => handleDragStart(e, square)}
                      onDragEnd={() => setDragOver(null)}
                    >
                      <Piece piece={piece} size="100%" />
                    </div>
                  )}
                  {isLegalTarget && !isCapture && (
                    <span className="pointer-events-none absolute h-[30%] w-[30%] rounded-full bg-zinc-900/30" />
                  )}
                  {isLegalTarget && isCapture && (
                    <span className="pointer-events-none absolute inset-0 ring-[6px] ring-inset ring-zinc-900/40" />
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-center pl-1 text-[10px] font-semibold text-zinc-400 sm:text-xs">
              {visualRows[visualRowIdx]}
            </div>
          </Fragment>
        ))}

        <div />
        {visualCols.map((f) => (
          <div
            key={`bot-file-${f}`}
            className="flex items-start justify-center pt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-xs"
          >
            {f}
          </div>
        ))}
        <div />
      </div>
    </div>
  );
}
