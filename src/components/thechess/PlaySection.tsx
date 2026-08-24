"use client";

import { useEffect, useMemo, useState } from "react";
import { useChessGame, type GameSettings } from "@/hooks/use-chess-game";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { CapturedPieces } from "@/components/chess/CapturedPieces";
import { StatusBar } from "@/components/chess/StatusBar";
import { GameControls } from "@/components/chess/GameControls";
import { SettingsPanel } from "@/components/chess/SettingsPanel";
import { PromotionDialog } from "@/components/chess/PromotionDialog";
import { colorLabel } from "@/lib/chess/pieces";
import { toast } from "sonner";
import { loadStats, recordGame, type Stats } from "@/lib/thechess/stats";

export function PlaySection() {
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [pendingSettings, setPendingSettings] = useState<GameSettings>({
    mode: "ai",
    playerColor: "w",
    difficulty: "medium",
  });
  const [stats, setStats] = useState<Stats>({ games: [], puzzles: [] });
  const [resultRecorded, setResultRecorded] = useState(false);

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const game = useChessGame({
    mode: "ai",
    playerColor: "w",
    difficulty: "medium",
  });

  const {
    snapshot,
    settings,
    pendingPromotion,
    isAiThinking,
    lastMoveSan,
    isHumanTurn,
    requestMove,
    completePromotion,
    cancelPromotion,
    newGame,
    undo,
  } = game;

  useEffect(() => {
    setPendingSettings(settings);
  }, [settings]);

  useEffect(() => {
    setOrientation(settings.playerColor);
  }, [settings.playerColor, settings.mode]);

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

  // Reset the "result recorded" flag when a new game starts (moves === 0).
  useEffect(() => {
    if (snapshot.moves.length === 0) {
      setResultRecorded(false);
    }
  }, [snapshot.moves.length]);

  // Record the game result once when the game ends.
  useEffect(() => {
    if (!isGameOver || resultRecorded || snapshot.moves.length === 0) return;
    if (settings.mode !== "ai") {
      setResultRecorded(true);
      return;
    }
    let result: "win" | "loss" | "draw" = "draw";
    if (snapshot.status === "checkmate") {
      // Side to move is checkmated. If side to move is the AI's color, human won.
      const humanWon = snapshot.turn !== settings.playerColor;
      result = humanWon ? "win" : "loss";
    } else {
      result = "draw";
    }
    const next = recordGame(stats, {
      mode: "ai",
      playerColor: settings.playerColor,
      difficulty: settings.difficulty,
      result,
      moves: snapshot.moves.length,
      opponentLabel: `AI (${settings.difficulty})`,
    });
    setStats(next);
    setResultRecorded(true);
  }, [isGameOver, snapshot.status, snapshot.turn, snapshot.moves.length, settings, stats, resultRecorded]);

  const canUndo = snapshot.moves.length > 0 && !isAiThinking;

  const handleMove = (from: any, to: any) => {
    requestMove(from, to);
  };

  const handleApplySettings = () => {
    newGame(pendingSettings);
    toast.success("New game started", {
      description: `Playing as ${colorLabel(pendingSettings.playerColor)} vs ${pendingSettings.mode === "ai" ? "AI" : "friend"}`,
    });
  };

  const handleNewGame = () => {
    newGame();
    toast.success("New game started");
  };

  const handleUndo = () => {
    if (!canUndo) return;
    undo();
    toast.info("Move undone");
  };

  const handleFlip = () => setOrientation((o) => (o === "w" ? "b" : "w"));

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(snapshot.fen);
      toast.success("FEN copied to clipboard");
    } catch {
      toast.error("Failed to copy FEN");
    }
  };

  const handleCopyPgn = async () => {
    const pgn = snapshot.moves
      .map((m, i) =>
        i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ${m.san}` : m.san,
      )
      .join(" ");
    try {
      await navigator.clipboard.writeText(pgn || "(no moves yet)");
      toast.success("PGN copied to clipboard");
    } catch {
      toast.error("Failed to copy PGN");
    }
  };

  // Show a toast when the game ends.
  useEffect(() => {
    if (isGameOver && snapshot.moves.length > 0) {
      const winner =
        snapshot.status === "checkmate"
          ? colorLabel(snapshot.turn === "w" ? "b" : "w")
          : null;
      if (winner) {
        const humanWon = snapshot.turn !== settings.playerColor;
        if (settings.mode === "ai") {
          toast.success(humanWon ? "You won!" : "AI wins", {
            description: "Click 'New Game' to play again.",
          });
        } else {
          toast.success(`Checkmate — ${winner} wins!`, {
            description: "Click 'New Game' to play again.",
          });
        }
      } else {
        toast.info(`Game over — ${snapshot.status.replace("-", " ")}`, {
          description: "Click 'New Game' to play again.",
        });
      }
    }
  }, [snapshot.status, isGameOver, snapshot.turn, snapshot.moves.length, settings.mode, settings.playerColor]);

  const opponentLabel =
    settings.mode === "ai" ? `AI (${settings.difficulty})` : "Player 2";

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        {/* Board column */}
        <div className="flex flex-col items-center gap-3 fade-in-up">
          <div className="flex w-full max-w-[640px] items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                {settings.mode === "ai" ? "AI" : "P2"}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{opponentLabel}</div>
                <div className="text-xs text-muted-foreground">
                  {orientation === "w" ? "Black" : "White"}
                </div>
              </div>
            </div>
            <TurnIndicator
              isTheirTurn={snapshot.turn !== settings.playerColor && settings.mode === "ai"}
              isAiThinking={isAiThinking}
            />
          </div>

          <div className="w-full max-w-[640px] rounded-md bg-card/60 p-2 ring-1 ring-border">
            <CapturedPieces
              capturedByWhite={snapshot.capturedByWhite}
              capturedByBlack={snapshot.capturedByBlack}
              perspective={orientation}
            />
          </div>

          <div className="w-full max-w-[640px]">
            <ChessBoard
              snapshot={snapshot}
              orientation={orientation}
              interactive={isHumanTurn && !isGameOver}
              onMove={handleMove}
            />
          </div>

          <div className="w-full max-w-[640px] rounded-md bg-card/60 p-2 ring-1 ring-border">
            <CapturedPieces
              capturedByWhite={snapshot.capturedByWhite}
              capturedByBlack={snapshot.capturedByBlack}
              perspective={orientation}
            />
          </div>

          <div className="flex w-full max-w-[640px] items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                You
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">You</div>
                <div className="text-xs text-muted-foreground">
                  {orientation === "w" ? "White" : "Black"}
                </div>
              </div>
            </div>
            <TurnIndicator isTheirTurn={isHumanTurn} isAiThinking={false} />
          </div>
        </div>

        <aside className="flex flex-col gap-4 fade-in-up">
          <StatusBar
            status={snapshot.status}
            turn={snapshot.turn}
            isHumanTurn={isHumanTurn}
            isAiThinking={isAiThinking}
            lastMoveSan={lastMoveSan}
            playerColor={settings.playerColor}
          />

          <GameControls
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onFlip={handleFlip}
            onCopyFen={handleCopyFen}
            onCopyPgn={handleCopyPgn}
            canUndo={canUndo}
            isGameOver={isGameOver}
          />

          <SettingsPanel
            settings={pendingSettings}
            onChange={setPendingSettings}
            onApply={handleApplySettings}
          />

          <MoveHistory moves={snapshot.moves} />

          <details className="rounded-lg border border-border bg-card/50 p-3 text-sm">
            <summary className="cursor-pointer font-semibold text-foreground">
              How to play
            </summary>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Click a piece to see its legal moves (dots/rings).</li>
              <li>• Click a highlighted square to move there.</li>
              <li>• Or drag and drop a piece onto a target square.</li>
              <li>• Reach the last rank with a pawn to promote it.</li>
              <li>• Use <em>Undo</em> to take back moves (undoes AI&apos;s reply too).</li>
              <li>• Use <em>Flip</em> to rotate the board.</li>
              <li>• Wins, losses, and draws are recorded in the <strong>Stats</strong> tab.</li>
            </ul>
          </details>
        </aside>
      </div>

      <PromotionDialog
        pending={pendingPromotion}
        onSelect={completePromotion}
        onCancel={cancelPromotion}
      />
    </section>
  );
}

function TurnIndicator({
  isTheirTurn,
  isAiThinking,
}: {
  isTheirTurn: boolean;
  isAiThinking: boolean;
}) {
  if (!isTheirTurn && !isAiThinking) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
        waiting
      </span>
    );
  }
  if (isAiThinking) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        thinking
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      to move
    </span>
  );
}
