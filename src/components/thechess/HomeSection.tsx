"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Crown,
  Puzzle,
  GraduationCap,
  Search,
  BarChart3,
  Globe2,
  Sparkles,
  Trophy,
  Target,
  Zap,
} from "lucide-react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { useMemo } from "react";
import { ChessEngine } from "@/lib/chess/engine";
import type { TabId } from "./Header";
import { PUZZLES } from "@/lib/thechess/puzzles";

interface HomeSectionProps {
  onNavigate: (tab: TabId) => void;
  previewUrl: string;
}

export function HomeSection({ onNavigate, previewUrl }: HomeSectionProps) {
  // Use a static "daily puzzle" preview from the first puzzle.
  const dailyPuzzle = PUZZLES[0];
  const snapshot = useMemo(() => {
    const engine = new ChessEngine(dailyPuzzle.fen);
    return engine.snapshot();
  }, [dailyPuzzle.fen]);

  return (
    <div className="fade-in-up">
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-zinc-900 to-zinc-950 px-4 py-10 text-white sm:py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Play. Learn. Analyze. All in one place.
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            thechess —{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              a complete chess platform
            </span>
          </h1>
          <p className="max-w-2xl text-base text-zinc-300 sm:text-lg">
            Play against an AI with three difficulty levels, solve tactical puzzles,
            study the openings, analyze positions, and track your stats — all in the browser,
            no signup required. Then link it to your own custom domain.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => onNavigate("play")}
            >
              <Crown className="h-4 w-4" />
              Play Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => onNavigate("puzzles")}
            >
              <Puzzle className="h-4 w-4" />
              Solve Puzzles
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => onNavigate("learn")}
            >
              <GraduationCap className="h-4 w-4" />
              Learn Chess
            </Button>
          </div>
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
                className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
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
                  <Target className="h-4 w-4 text-emerald-600" />
                  {dailyPuzzle.title}
                </CardTitle>
                <CardDescription>
                  Side to move: {dailyPuzzle.sideToMove === "w" ? "White" : "Black"} · Rating: ~{dailyPuzzle.rating}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  This puzzle tests the <strong>{dailyPuzzle.theme.replace("-", " ")}</strong> motif.
                  Find the move that exploits the key weakness in the position.
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onNavigate("puzzles")}
                >
                  Open in Puzzles →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="border-t border-border bg-zinc-50 px-4 py-12 dark:bg-zinc-950/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground">
            Everything you need to play
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Crown className="h-5 w-5" />}
              title="Play vs AI"
              desc="Three difficulty levels powered by minimax + alpha-beta pruning. Or play two-player pass-and-play with a friend."
              onClick={() => onNavigate("play")}
              cta="Start a game"
            />
            <FeatureCard
              icon={<Puzzle className="h-5 w-5" />}
              title="Tactical Puzzles"
              desc="Curated puzzles covering forks, pins, skewers, back-rank mates, and discovered attacks. Solve them and improve."
              onClick={() => onNavigate("puzzles")}
              cta="Browse puzzles"
            />
            <FeatureCard
              icon={<GraduationCap className="h-5 w-5" />}
              title="Lessons"
              desc="Original lessons covering the rules, opening principles, tactical motifs, and endgame technique."
              onClick={() => onNavigate("learn")}
              cta="Start learning"
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Opening Explorer"
              desc="Eight classic openings with key ideas for both sides. Load any position into the analysis board with one click."
              onClick={() => onNavigate("learn")}
              cta="Explore openings"
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Analysis Board"
              desc="Load any FEN, move pieces freely for both colors, and explore variations. Copy FEN or PGN to share."
              onClick={() => onNavigate("analysis")}
              cta="Open analysis"
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Stats Tracking"
              desc="Track your wins, losses, draws, puzzle accuracy, and current streak — all stored locally on your device."
              onClick={() => onNavigate("stats")}
              cta="View stats"
            />
          </div>
        </div>
      </section>

      {/* Custom domain CTA */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-6 ring-1 ring-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Link your custom domain</h3>
              <p className="text-sm text-muted-foreground">
                Your chess site is live at{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {previewUrl || "your-site"}
                </code>
                . Connect your own domain (e.g.{" "}
                <code className="font-mono text-xs">play.mybrand.com</code>) in about 5 minutes.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <DomainStep n={1} title="Choose a host" desc="Vercel, Cloudflare Pages, Netlify, or self-host." />
            <DomainStep n={2} title="Add your domain" desc="Follow the host's domain setup instructions." />
            <DomainStep n={3} title="Configure DNS" desc="Point a CNAME at your host's endpoint." />
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
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  cta: string;
}) {
  return (
    <Card className="flex flex-col gap-2 transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="flex-1 text-sm text-muted-foreground">{desc}</p>
        <button
          onClick={onClick}
          className="self-start rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {cta} →
        </button>
      </CardContent>
    </Card>
  );
}

function DomainStep({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-lg bg-background/60 p-3">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
          {n}
        </div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
