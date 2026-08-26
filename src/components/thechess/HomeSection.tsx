"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Crown,
  Puzzle,
  GraduationCap,
  Search,
  BarChart3,
  Swords,
  Sparkles,
  Trophy,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { useMemo } from "react";
import { ChessEngine } from "@/lib/chess/engine";
import type { TabId } from "./Header";
import { PUZZLES } from "@/lib/thechess/puzzles";
import { LogoMark } from "./Logo";
import { TIERS, tierForRating } from "@/lib/thechess/tiers";
import { useAuth } from "@/hooks/use-auth";
import { TierLadder } from "./TierLadder";

interface HomeSectionProps {
  onNavigate: (tab: TabId) => void;
}

export function HomeSection({ onNavigate }: HomeSectionProps) {
  const dailyPuzzle = PUZZLES[0];
  const snapshot = useMemo(() => {
    const engine = new ChessEngine(dailyPuzzle.fen);
    return engine.snapshot();
  }, [dailyPuzzle.fen]);
  const { user, isAuthenticated } = useAuth();
  const tier = user ? tierForRating(user.rating) : null;

  return (
    <div className="fade-in-up">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border px-4 py-12 sm:py-20">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size={64} className="float" />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Real-time multiplayer · live now
          </div>
          <h1 className="bg-gradient-to-br from-white via-emerald-100 to-emerald-300 bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent sm:text-6xl">
            thechess
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-300 sm:text-lg">
            Play live chess against opponents worldwide. Climb the rating ladder from{" "}
            <span className="text-amber-400">Bronze</span> to{" "}
            <span className="text-red-400">Grandmaster</span>. Solve puzzles. Learn the openings. Earn XP.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              size="lg"
              className="gap-2 text-base pulse-glow"
              onClick={() => onNavigate("play-online")}
            >
              <Swords className="h-5 w-5" />
              {isAuthenticated ? "Find a Game" : "Play Online"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border bg-transparent text-foreground hover:bg-muted"
              onClick={() => onNavigate("puzzles")}
            >
              <Puzzle className="h-4 w-4" />
              Solve Puzzles
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-border bg-transparent text-foreground hover:bg-muted"
              onClick={() => onNavigate("play-ai")}
            >
              <Crown className="h-4 w-4" />
              Play vs AI
            </Button>
          </div>

          {/* User greeting */}
          {isAuthenticated && user && tier && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-card/60 px-4 py-2 text-sm ring-1 ring-border backdrop-blur">
              <span className="text-muted-foreground">Welcome back,</span>
              <span className="font-semibold text-foreground">{user.username}</span>
              <span className="text-muted-foreground">·</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white tier-${tier.id}`}>
                {tier.emoji} {tier.label}
              </span>
              <span className="font-bold" style={{ color: tier.color }}>
                {user.rating}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Daily puzzle */}
      <section className="px-4 py-10 sm:py-14">
        <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_320px]">
          <div className="fade-in-up">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
              Puzzle of the Day
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              A {dailyPuzzle.difficulty} {dailyPuzzle.theme.replace("-", " ")} puzzle.{" "}
              <button
                onClick={() => onNavigate("puzzles")}
                className="font-semibold text-emerald-400 hover:underline"
              >
                Solve it →
              </button>
            </p>
            <div className="w-full max-w-[480px]">
              <ChessBoard
                snapshot={snapshot}
                orientation={dailyPuzzle.sideToMove}
                interactive={false}
                onMove={() => {}}
              />
            </div>
          </div>
          <div className="fade-in-up">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-emerald-400" />
                  {dailyPuzzle.title}
                </CardTitle>
                <CardDescription>
                  Side to move: {dailyPuzzle.sideToMove === "w" ? "White" : "Black"} · ~{dailyPuzzle.rating}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This puzzle tests the <strong>{dailyPuzzle.theme.replace("-", " ")}</strong> motif.
                  Find the move that exploits the key weakness.
                </p>
                <Button size="sm" className="w-full" onClick={() => onNavigate("puzzles")}>
                  Open in Puzzles →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-border bg-card/30 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground">
            Everything you need to play
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Swords className="h-5 w-5" />}
              title="Play Online"
              desc="Real-time chess with matchmaking by rating. Resign, draw, or fight to the last move."
              onClick={() => onNavigate("play-online")}
              cta="Find a game"
              accent="emerald"
            />
            <FeatureCard
              icon={<Crown className="h-5 w-5" />}
              title="Play vs AI"
              desc="Three difficulty levels powered by minimax + alpha-beta pruning. Or pass-and-play with a friend."
              onClick={() => onNavigate("play-ai")}
              cta="Start a game"
              accent="amber"
            />
            <FeatureCard
              icon={<Puzzle className="h-5 w-5" />}
              title="Tactical Puzzles"
              desc="12 curated puzzles covering forks, pins, skewers, back-rank mates, and discovered attacks."
              onClick={() => onNavigate("puzzles")}
              cta="Browse puzzles"
              accent="violet"
            />
            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Lessons & Openings"
              desc="Original lessons plus an explorer with 8 classic openings. Learn the ideas for both sides."
              onClick={() => onNavigate("learn")}
              cta="Start learning"
              accent="sky"
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Analysis Board"
              desc="Load any FEN, move pieces freely for both colors, undo/redo, and explore variations."
              onClick={() => onNavigate("analysis")}
              cta="Open analysis"
              accent="emerald"
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="Leaderboard & Profile"
              desc="Climb the global ladder. Track your rating, XP, level, and game history on your profile."
              onClick={() => onNavigate("leaderboard")}
              cta="See rankings"
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* Tiers ladder */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center fade-in-up">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Climb the Ladder
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every game updates your Elo rating. Ascend from Bronze to Grandmaster. Click a rung to see details.
            </p>
          </div>
          <div className="fade-in-up">
            <TierLadder />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  onClick,
  cta,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  cta: string;
  accent: "emerald" | "amber" | "violet" | "sky";
}) {
  const accentClass = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    violet: "bg-violet-500/10 text-violet-400",
    sky: "bg-sky-500/10 text-sky-400",
  }[accent];
  return (
    <Card className="group flex flex-col gap-2 transition-all hover:border-primary/40 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${accentClass} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="flex-1 text-sm text-muted-foreground">{desc}</p>
        <button
          onClick={onClick}
          className="inline-flex items-center gap-1 self-start rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {cta}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </CardContent>
    </Card>
  );
}
