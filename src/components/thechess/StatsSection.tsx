"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  loadStats,
  summarizeStats,
  type Stats,
  type StatsSummary,
} from "@/lib/thechess/stats";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  TrendingUp,
  Flame,
  Brain,
  Trash2,
  BarChart3,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export function StatsSection() {
  const [stats, setStats] = useState<Stats>({ games: [], puzzles: [] });

  useEffect(() => {
    setStats(loadStats());
  }, []);

  const summary: StatsSummary = useMemo(() => summarizeStats(stats), [stats]);

  const handleReset = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Reset all stats? This cannot be undone.")) {
      const empty: Stats = { games: [], puzzles: [] };
      setStats(empty);
      try {
        window.localStorage.removeItem("thechess:stats:v1");
      } catch {
        // ignore
      }
      toast.success("Stats reset");
    }
  };

  const recentGames = stats.games.slice(-10).reverse();

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-end justify-between fade-in-up">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Your Stats
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your games, puzzles, and streaks. All data is stored locally on your device.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
            <Trash2 className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-in-up">
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Games played"
            value={summary.gamesPlayed.toString()}
            sub={`${summary.wins}W · ${summary.losses}L · ${summary.draws}D`}
            tone="bg-emerald-500/10 text-emerald-600"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Win rate"
            value={`${Math.round(summary.winRate * 100)}%`}
            sub={`${summary.wins} wins of ${summary.gamesPlayed}`}
            tone="bg-sky-500/10 text-sky-600"
          />
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Current streak"
            value={summary.currentStreak.toString()}
            sub={`Best: ${summary.bestStreak}`}
            tone="bg-amber-500/10 text-amber-600"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Puzzles solved"
            value={`${summary.puzzlesSolved}/${summary.puzzlesAttempted}`}
            sub={`${Math.round(summary.puzzleAccuracy * 100)}% accuracy`}
            tone="bg-violet-500/10 text-violet-600"
          />
        </div>

        {/* Win rate by difficulty */}
        <Card className="mb-6 fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Performance by AI difficulty
            </CardTitle>
            <CardDescription>Wins vs games played for each AI level.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["easy", "medium", "hard"] as const).map((diff) => {
                const d = summary.byDifficulty[diff];
                const pct = d.played > 0 ? Math.round((d.wins / d.played) * 100) : 0;
                return (
                  <div key={diff} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-foreground">{diff}</span>
                      <span className="text-xs text-muted-foreground">
                        {d.wins} / {d.played} {d.played > 0 ? `· ${pct}%` : ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent games */}
        <Card className="fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-emerald-600" />
              Recent games
            </CardTitle>
            <CardDescription>Last {Math.min(10, recentGames.length)} games you&apos;ve played.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {recentGames.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Brain className="mx-auto mb-2 h-8 w-8 opacity-30" />
                No games yet. Head to the <strong>Play</strong> tab and start a game!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentGames.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-2 px-4 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          g.result === "win"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : g.result === "loss"
                            ? "bg-red-500/15 text-red-600"
                            : "bg-zinc-500/15 text-zinc-600"
                        }`}
                      >
                        {g.result === "win" ? "W" : g.result === "loss" ? "L" : "D"}
                      </span>
                      <div>
                        <div className="font-medium text-foreground">
                          vs {g.opponentLabel}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {g.playerColor === "w" ? "White" : "Black"} · {g.moves} moves ·{" "}
                          {new Date(g.timestamp).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">
                      {g.mode}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
      </CardContent>
    </Card>
  );
}
