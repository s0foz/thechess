"use client";

import { useCallback, useState } from "react";
import { Chess, type Square } from "chess.js";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { ChessEngine, type EngineSnapshot } from "@/lib/chess/engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RotateCcw, Copy, ChevronLeft, ChevronRight, FlipHorizontal, Trash2 } from "lucide-react";
import { MoveHistory } from "@/components/chess/MoveHistory";

const STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function AnalysisSection() {
  const [engine] = useState(() => new ChessEngine());
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => engine.snapshot());
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [fenInput, setFenInput] = useState("");
  const [history, setHistory] = useState<string[]>([STARTING_FEN]); // FEN stack
  const [historyIndex, setHistoryIndex] = useState(0);

  const refresh = useCallback(() => {
    setSnapshot(engine.snapshot());
  }, [engine]);

  const pushHistory = useCallback(
    (fen: string) => {
      const newStack = history.slice(0, historyIndex + 1);
      newStack.push(fen);
      // Cap at 200 entries.
      while (newStack.length > 200) newStack.shift();
      setHistory(newStack);
      setHistoryIndex(newStack.length - 1);
    },
    [history, historyIndex],
  );

  const handleMove = (from: Square, to: Square) => {
    // Try the move; if it's legal, apply it. Otherwise no-op.
    const chess = new Chess(snapshot.fen);
    try {
      const mv = chess.move({ from, to, promotion: "q" });
      if (!mv) return;
      engine.move(from, to, mv.promotion as any);
      refresh();
      pushHistory(engine.fen);
    } catch {
      // illegal
    }
  };

  const handleReset = () => {
    const e = new ChessEngine();
    Object.assign(engine, e);
    refresh();
    setHistory([STARTING_FEN]);
    setHistoryIndex(0);
    toast.info("Board reset to starting position");
  };

  const handleFlip = () => setOrientation((o) => (o === "w" ? "b" : "w"));

  const handleLoadFen = () => {
    const fen = fenInput.trim();
    if (!fen) {
      toast.error("Enter a FEN first");
      return;
    }
    try {
      const chess = new Chess(fen);
      if (!chess) throw new Error("Invalid FEN");
      const newEngine = new ChessEngine(fen);
      Object.assign(engine, newEngine);
      refresh();
      setHistory([fen]);
      setHistoryIndex(0);
      toast.success("FEN loaded");
      setFenInput("");
    } catch {
      toast.error("Invalid FEN string");
    }
  };

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(snapshot.fen);
      toast.success("FEN copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleUndo = () => {
    if (historyIndex === 0) return;
    const newIndex = historyIndex - 1;
    const fen = history[newIndex];
    try {
      const newEngine = new ChessEngine(fen);
      Object.assign(engine, newEngine);
      refresh();
      setHistoryIndex(newIndex);
    } catch {
      // ignore
    }
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const fen = history[newIndex];
    try {
      const newEngine = new ChessEngine(fen);
      Object.assign(engine, newEngine);
      refresh();
      setHistoryIndex(newIndex);
    } catch {
      // ignore
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Analysis Board
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Load any position by FEN, move pieces freely for both colors, and step through your
            analysis with undo/redo. Great for exploring openings or working through a game.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4 fade-in-up">
            <div className="w-full max-w-[640px]">
              <ChessBoard
                snapshot={snapshot}
                orientation={orientation}
                interactive
                onMove={handleMove}
              />
            </div>

            <div className="flex flex-wrap gap-2 max-w-[640px]">
              <Button size="sm" variant="secondary" onClick={handleUndo} disabled={!canUndo} className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Undo
              </Button>
              <Button size="sm" variant="secondary" onClick={handleRedo} disabled={!canRedo} className="gap-1">
                Redo
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" onClick={handleFlip} className="gap-1">
                <FlipHorizontal className="h-4 w-4" />
                Flip
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyFen} className="gap-1">
                <Copy className="h-4 w-4" />
                Copy FEN
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <Card className="max-w-[640px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="break-all rounded-md bg-muted p-2 font-mono text-xs text-muted-foreground">
                  {snapshot.fen}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {snapshot.turn === "w" ? "White" : "Black"} to move · Move {Math.floor(snapshot.moves.length / 2) + 1}
                  </span>
                  {snapshot.inCheck && (
                    <span className="rounded-md bg-red-500/15 px-1.5 py-0.5 font-semibold text-red-600 dark:text-red-400">
                      Check!
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="flex flex-col gap-4 fade-in-up">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Load a FEN</CardTitle>
                <CardDescription>
                  Paste a FEN string to analyze any position.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={fenInput}
                  onChange={(e) => setFenInput(e.target.value)}
                  placeholder={STARTING_FEN}
                  className="font-mono text-xs"
                />
                <Button size="sm" className="w-full" onClick={handleLoadFen}>
                  Load position
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <QuickFen
                  label="Starting position"
                  fen={STARTING_FEN}
                  onLoad={(fen) => {
                    setFenInput(fen);
                    handleLoadFen();
                  }}
                />
                <QuickFen
                  label="Italian Game (after 3.Bc4)"
                  fen="r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3"
                  onLoad={(fen) => {
                    setFenInput(fen);
                    handleLoadFen();
                  }}
                />
                <QuickFen
                  label="Sicilian (after 1...c5)"
                  fen="rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 2 2"
                  onLoad={(fen) => {
                    setFenInput(fen);
                    handleLoadFen();
                  }}
                />
                <QuickFen
                  label="Endgame: K+Q vs K"
                  fen="8/8/8/4k3/8/8/3K4/4Q3 w - - 0 1"
                  onLoad={(fen) => {
                    setFenInput(fen);
                    handleLoadFen();
                  }}
                />
                <QuickFen
                  label="Endgame: K+R vs K"
                  fen="8/8/8/4k3/8/8/3K4/3R4 w - - 0 1"
                  onLoad={(fen) => {
                    setFenInput(fen);
                    handleLoadFen();
                  }}
                />
              </CardContent>
            </Card>

            <MoveHistory moves={snapshot.moves} />
          </aside>
        </div>
      </div>
    </section>
  );
}

function QuickFen({ label, fen, onLoad }: { label: string; fen: string; onLoad: (fen: string) => void }) {
  return (
    <button
      onClick={() => onLoad(fen)}
      className="flex w-full items-center justify-between rounded-md border border-border bg-background px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted"
    >
      <span className="text-foreground">{label}</span>
      <ChevronRight className="h-3 w-3 text-muted-foreground" />
    </button>
  );
}
