"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { ChessEngine, type EngineSnapshot } from "@/lib/chess/engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PUZZLES,
  THEME_LABELS,
  THEME_DESCRIPTIONS,
  type Puzzle,
  type PuzzleTheme,
} from "@/lib/thechess/puzzles";
import { loadStats, recordPuzzle, type Stats } from "@/lib/thechess/stats";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Lightbulb, RotateCcw, ChevronRight } from "lucide-react";

type PuzzleState = "idle" | "solving" | "solved" | "failed";

export function PuzzlesSection() {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle>(PUZZLES[0]);
  const [state, setState] = useState<PuzzleState>("idle");
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() =>
    new ChessEngine(activePuzzle.fen).snapshot(),
  );
  const [orientation, setOrientation] = useState<"w" | "b">(activePuzzle.sideToMove);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ games: [], puzzles: [] });
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [filter, setFilter] = useState<PuzzleTheme | "all">("all");

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const solvedPuzzleIds = useMemo(
    () => new Set(stats.puzzles.filter((p) => p.solved).map((p) => p.id)),
    [stats.puzzles],
  );

  const filteredPuzzles = useMemo(() => {
    if (filter === "all") return PUZZLES;
    return PUZZLES.filter((p) => p.theme === filter);
  }, [filter]);

  const loadPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    setSnapshot(new ChessEngine(puzzle.fen).snapshot());
    setOrientation(puzzle.sideToMove);
    setSolutionIndex(0);
    setState("idle");
    setAttempts(0);
    setShowHint(false);
  };

  const handleMove = (from: Square, to: Square) => {
    if (state === "solved" || state === "failed") return;

    // Try the move on a temp engine to validate against the expected solution.
    const tempEngine = new ChessEngine(snapshot.fen);
    const expectedSan = activePuzzle.solution[solutionIndex];

    let attemptedSan: string | null = null;
    try {
      const chess = new Chess(snapshot.fen);
      const mv = chess.move({ from, to, promotion: "q" });
      if (mv) attemptedSan = mv.san;
    } catch {
      attemptedSan = null;
    }

    if (!attemptedSan) return;

    const correct = attemptedSan === expectedSan ||
      // Loose match: ignore +/# decorations (some SAN variants add check marks).
      attemptedSan.replace(/[+#]/g, "") === expectedSan.replace(/[+#]/g, "");

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (!correct) {
      setState("failed");
      const next = recordPuzzle(stats, activePuzzle.id, false);
      setStats(next);
      toast.error("Not quite!", {
        description: `You played ${attemptedSan}. Try again.`,
      });
      return;
    }

    // Apply the correct move on the engine.
    tempEngine.move(from, to);
    const newIndex = solutionIndex + 1;

    if (newIndex >= activePuzzle.solution.length) {
      // Solved!
      setSnapshot(tempEngine.snapshot());
      setSolutionIndex(newIndex);
      setState("solved");
      const next = recordPuzzle(stats, activePuzzle.id, true);
      setStats(next);
      toast.success("Puzzle solved!", {
        description: `Solved in ${newAttempts} attempt${newAttempts > 1 ? "s" : ""}.`,
      });
      return;
    }

    // Apply the opponent's reply (the next solution move).
    const replySan = activePuzzle.solution[newIndex];
    const chess = new Chess(tempEngine.fen);
    try {
      const reply = chess.move(replySan);
      if (reply) {
        tempEngine.move(reply.from as Square, reply.to as Square, reply.promotion as any);
      }
    } catch {
      // ignore
    }
    setSnapshot(tempEngine.snapshot());
    setSolutionIndex(newIndex + 1);
    setState("solving");
    toast.success("Correct!", {
      description: `Now find the next move.`,
    });
  };

  const handleReset = () => {
    setSnapshot(new ChessEngine(activePuzzle.fen).snapshot());
    setSolutionIndex(0);
    setState("idle");
    setAttempts(0);
    setShowHint(false);
  };

  const handleNextPuzzle = () => {
    const idx = PUZZLES.findIndex((p) => p.id === activePuzzle.id);
    const next = PUZZLES[(idx + 1) % PUZZLES.length];
    loadPuzzle(next);
  };

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Chess Puzzles
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Find the best move. {PUZZLES.length} curated puzzles covering tactical motifs from easy mates to advanced combinations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Board + puzzle info */}
          <div className="flex flex-col gap-4 fade-in-up">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                {THEME_LABELS[activePuzzle.theme]}
              </span>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                {activePuzzle.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">~{activePuzzle.rating} rating</span>
              {solvedPuzzleIds.has(activePuzzle.id) && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Solved
                </span>
              )}
            </div>

            <div className="w-full max-w-[560px]">
              <ChessBoard
                snapshot={snapshot}
                orientation={orientation}
                interactive={state !== "solved" && state !== "failed"}
                onMove={handleMove}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{activePuzzle.title}</CardTitle>
                <CardDescription>
                  {state === "solved"
                    ? "Solved!"
                    : state === "failed"
                    ? "Try again"
                    : solutionIndex === 0
                    ? `Find the best move for ${activePuzzle.sideToMove === "w" ? "White" : "Black"}.`
                    : `Continue the combination. Move ${Math.floor(solutionIndex / 2) + 1} for ${activePuzzle.sideToMove === "w" ? "White" : "Black"}.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {state === "solved" && (
                  <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      Solved!
                    </div>
                    <p>{activePuzzle.explanation}</p>
                  </div>
                )}
                {state === "failed" && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <XCircle className="h-4 w-4" />
                      Not the right move.
                    </div>
                    <p>Reset and try again. Or get a hint if you&apos;re stuck.</p>
                  </div>
                )}
                {showHint && state !== "solved" && (
                  <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                    <div className="mb-1 flex items-center gap-2 font-semibold">
                      <Lightbulb className="h-4 w-4" />
                      Hint
                    </div>
                    <p>
                      {THEME_DESCRIPTIONS[activePuzzle.theme]} Look for a move that targets a weakness near the enemy king.
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={handleReset} className="gap-1">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHint(true)}
                    disabled={showHint || state === "solved"}
                    className="gap-1"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Hint
                  </Button>
                  <Button size="sm" onClick={handleNextPuzzle} className="gap-1">
                    Next puzzle
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Puzzle list */}
          <aside className="fade-in-up">
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Filter by theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      filter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    All ({PUZZLES.length})
                  </button>
                  {(Object.keys(THEME_LABELS) as PuzzleTheme[]).map((theme) => {
                    const count = PUZZLES.filter((p) => p.theme === theme).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={theme}
                        onClick={() => setFilter(theme)}
                        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          filter === theme
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {THEME_LABELS[theme]} ({count})
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Puzzle list</CardTitle>
                <CardDescription>{filteredPuzzles.length} puzzles</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[480px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  {filteredPuzzles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => loadPuzzle(p)}
                      className={`flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-muted/50 ${
                        p.id === activePuzzle.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {p.title}
                          </span>
                          {solvedPuzzleIds.has(p.id) && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {THEME_LABELS[p.theme]} · ~{p.rating}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
