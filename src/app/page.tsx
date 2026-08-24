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
import { CustomDomainSection } from "@/components/chess/CustomDomainSection";
import { colorLabel } from "@/lib/chess/pieces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Crown, Globe2, Github } from "lucide-react";

export default function Home() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [pendingSettings, setPendingSettings] = useState<GameSettings>({
    mode: "ai",
    playerColor: "w",
    difficulty: "medium",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPreviewUrl(window.location.origin);
    }
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

  // Keep the pending settings in sync with the active settings so the panel
  // shows the current values when the user opens it.
  useEffect(() => {
    setPendingSettings(settings);
  }, [settings]);

  // When a new game starts, orient the board to the human's color.
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

  const canUndo = snapshot.moves.length > 0 && !isAiThinking;

  const handleMove = (from: any, to: any) => {
    requestMove(from, to);
  };

  const handleApplySettings = () => {
    newGame(pendingSettings);
    toast.success("New game started", {
      description: `Playing as ${colorLabel(
        pendingSettings.playerColor,
      )} vs ${pendingSettings.mode === "ai" ? "AI" : "friend"}`,
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

  const handleFlip = () => {
    setOrientation((o) => (o === "w" ? "b" : "w"));
  };

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
        toast.success(`Checkmate — ${winner} wins!`, {
          description: "Click 'New Game' to play again.",
        });
      } else {
        toast.info(`Game over — ${snapshot.status.replace("-", " ")}`, {
          description: "Click 'New Game' to play again.",
        });
      }
    }
  }, [snapshot.status, isGameOver, snapshot.turn, snapshot.moves.length]);

  const opponentLabel =
    settings.mode === "ai"
      ? `AI (${settings.difficulty})`
      : "Player 2";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <Header previewUrl={previewUrl} />

      <main className="flex flex-1 flex-col">
        {/* Hero strip */}
        <section className="border-b border-border bg-gradient-to-br from-zinc-900 to-zinc-950 px-4 py-10 text-white sm:py-14">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
              <Crown className="h-3.5 w-3.5" />
              Pure browser chess — no signup, no ads
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Play Chess.{" "}
              <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                Bring Your Domain.
              </span>
            </h1>
            <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
              A complete chess experience — legal-move validation, check &amp; checkmate
              detection, pawn promotion, AI opponent with three difficulty levels, and full
              move history. Then connect it to your own custom domain in five minutes.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <a href="#play">
                <Button size="lg" className="gap-2">
                  <Crown className="h-4 w-4" />
                  Play Now
                </Button>
              </a>
              <a href="#custom-domain">
                <Button size="lg" variant="outline" className="gap-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white">
                  <Globe2 className="h-4 w-4" />
                  Link a Domain
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Game section */}
        <section id="play" className="px-4 py-8 sm:py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
            {/* Board column */}
            <div className="flex flex-col items-center gap-3 fade-in-up">
              {/* Opponent label */}
              <div className="flex w-full max-w-[640px] items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-white">
                    {settings.mode === "ai" ? "AI" : "P2"}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {opponentLabel}
                    </div>
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

              {/* Opponent's captures */}
              <div className="w-full max-w-[640px] rounded-md bg-card/60 p-2 ring-1 ring-border">
                <CapturedPieces
                  capturedByWhite={snapshot.capturedByWhite}
                  capturedByBlack={snapshot.capturedByBlack}
                  perspective={orientation}
                />
              </div>

              {/* Board */}
              <div className="w-full max-w-[640px]">
                <ChessBoard
                  snapshot={snapshot}
                  orientation={orientation}
                  interactive={isHumanTurn && !isGameOver}
                  onMove={handleMove}
                />
              </div>

              {/* My captures */}
              <div className="w-full max-w-[640px] rounded-md bg-card/60 p-2 ring-1 ring-border">
                <CapturedPieces
                  capturedByWhite={snapshot.capturedByWhite}
                  capturedByBlack={snapshot.capturedByBlack}
                  perspective={orientation}
                />
              </div>

              {/* My label */}
              <div className="flex w-full max-w-[640px] items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                    You
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      You
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {orientation === "w" ? "White" : "Black"}
                    </div>
                  </div>
                </div>
                <TurnIndicator
                  isTheirTurn={isHumanTurn}
                  isAiThinking={false}
                />
              </div>
            </div>

            {/* Side panel */}
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
                </ul>
              </details>
            </aside>
          </div>
        </section>

        {/* Custom domain section */}
        <CustomDomainSection previewUrl={previewUrl || "https://your-site.example"} />

        {/* Features section */}
        <section className="border-t border-border bg-zinc-50 px-4 py-12 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground">
              Everything you need to play
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Feature
                icon={<Crown className="h-5 w-5" />}
                title="Full rules"
                desc="Castling, en passant, promotion, threefold & 50-move draws, stalemate — all handled by chess.js."
              />
              <Feature
                icon={<Crown className="h-5 w-5" />}
                title="AI opponent"
                desc="Minimax with alpha-beta pruning, piece-square tables, and three difficulty levels."
              />
              <Feature
                icon={<Crown className="h-5 w-5" />}
                title="Two-player mode"
                desc="Pass-and-play with a friend on the same device, with optional board flip."
              />
              <Feature
                icon={<Crown className="h-5 w-5" />}
                title="Export games"
                desc="Copy the position as FEN or the full game as PGN to share with friends or analyze elsewhere."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <PromotionDialog
        pending={pendingPromotion}
        onSelect={completePromotion}
        onCancel={cancelPromotion}
      />
    </div>
  );
}

function Header({ previewUrl }: { previewUrl: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-zinc-900 to-zinc-700 text-lg text-white shadow">
            ♞
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Chess Royale
          </span>
        </a>
        <nav className="flex items-center gap-1">
          <a
            href="#play"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Play
          </a>
          <a
            href="#custom-domain"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Custom Domain
          </a>
          {previewUrl && (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 hidden rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:inline-block"
            >
              Open Site
            </a>
          )}
        </nav>
      </div>
    </header>
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

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-4 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div className="text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">Chess Royale</div>
          <div>Built with Next.js, chess.js, and Tailwind CSS.</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a href="#play" className="hover:text-foreground">Play</a>
          <span>•</span>
          <a href="#custom-domain" className="hover:text-foreground">Custom Domain</a>
          <span>•</span>
          <a
            href="https://github.com/jhlywa/chess.js"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Github className="h-3 w-3" />
            chess.js
          </a>
        </div>
      </div>
    </footer>
  );
}
