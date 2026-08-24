"use client";

import type { GameStatus, PieceColor } from "@/lib/chess/engine";
import { colorLabel } from "@/lib/chess/pieces";

interface StatusBarProps {
  status: GameStatus;
  turn: PieceColor;
  isHumanTurn: boolean;
  isAiThinking: boolean;
  lastMoveSan: string | null;
  playerColor: PieceColor;
}

function statusMessage(status: GameStatus, turn: PieceColor): { text: string; tone: "info" | "warning" | "danger" | "success" } {
  switch (status) {
    case "checkmate":
      return {
        text: `Checkmate — ${colorLabel(turn === "w" ? "b" : "w")} wins`,
        tone: "danger",
      };
    case "stalemate":
      return { text: "Stalemate — draw", tone: "warning" };
    case "draw":
      return { text: "Draw", tone: "warning" };
    case "threefold":
      return { text: "Draw by threefold repetition", tone: "warning" };
    case "insufficient":
      return { text: "Draw — insufficient material", tone: "warning" };
    case "fifty-move":
      return { text: "Draw — fifty-move rule", tone: "warning" };
    case "check":
      return { text: `Check — ${colorLabel(turn)} to respond`, tone: "danger" };
    case "playing":
    default:
      return { text: `${colorLabel(turn)} to move`, tone: "info" };
  }
}

const toneClasses: Record<"info" | "warning" | "danger" | "success", string> = {
  info: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  danger: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
};

export function StatusBar({
  status,
  turn,
  isHumanTurn,
  isAiThinking,
  lastMoveSan,
  playerColor,
}: StatusBarProps) {
  const { text, tone } = statusMessage(status, turn);

  let subtitle: string | null = null;
  if (status === "playing" || status === "check") {
    if (isAiThinking) {
      subtitle = "AI is thinking…";
    } else if (isHumanTurn) {
      subtitle = "Your move";
    } else {
      subtitle = "Opponent's move";
    }
  }

  return (
    <div className={`flex flex-col gap-2 rounded-lg p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{tone === "info" ? "♟" : tone === "warning" ? "⚠" : tone === "danger" ? "★" : "✓"}</span>
          <div>
            <div className="text-sm font-semibold sm:text-base">{text}</div>
            {subtitle && (
              <div className="text-xs opacity-75">{subtitle}</div>
            )}
          </div>
        </div>
        <div className="text-right text-xs opacity-75">
          {lastMoveSan ? (
            <span>
              Last: <span className="font-mono font-semibold">{lastMoveSan}</span>
            </span>
          ) : (
            <span>New game</span>
          )}
        </div>
      </div>
      {/* Tiny indicator of which player is "us" */}
      <div className="flex items-center gap-2 text-[10px] opacity-70">
        <span>
          You are <span className="font-semibold">{colorLabel(playerColor)}</span>
        </span>
        <span>•</span>
        <span>Playing as <span className="font-semibold">{colorLabel(playerColor)}</span></span>
      </div>
    </div>
  );
}
