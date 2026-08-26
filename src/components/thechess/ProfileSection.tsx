"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  TrendingUp,
  Flame,
  Crown,
  Target,
  Loader2,
  Calendar,
  Swords,
} from "lucide-react";
import { tierForRating, xpProgress, nextTier } from "@/lib/thechess/tiers";
import { LogoMark } from "./Logo";
import { TierLadder } from "./TierLadder";

interface ProfileData {
  user: {
    id: string;
    username: string;
    rating: number;
    level: number;
    xp: number;
    wins: number;
    losses: number;
    draws: number;
    puzzlesSolved: number;
    createdAt: string;
  };
  recentGames: Array<{
    id: string;
    result: string;
    reason: string | null;
    endedAt: string | null;
    white: { id: string; username: string; rating: number };
    black: { id: string; username: string; rating: number };
  }>;
}

export function ProfileSection() {
  const { user: sessionUser, isAuthenticated, isLoading } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAuthenticated]);

  if (isLoading || loading) {
    return (
      <section className="px-4 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (!isAuthenticated || !data?.user) {
    return (
      <section className="px-4 py-16">
        <div className="mx-auto max-w-md text-center fade-in-up">
          <LogoMark size={48} className="mx-auto mb-3 float" />
          <h2 className="text-xl font-bold text-foreground">Sign in to see your profile</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your rating, XP, level, game history, and stats live here. Create an account to start
            climbing the ladder.
          </p>
        </div>
      </section>
    );
  }

  const u = data.user;
  const tier = tierForRating(u.rating);
  const xp = xpProgress(u.xp);
  const next = nextTier(u.rating);
  const totalGames = u.wins + u.losses + u.draws;
  const winRate = totalGames > 0 ? Math.round((u.wins / totalGames) * 100) : 0;

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Profile header */}
        <Card className="mb-6 overflow-hidden fade-in-up">
          <div className={`bg-gradient-to-br tier-${tier.id} px-6 py-8`}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/30 text-3xl font-bold text-white backdrop-blur-sm">
                {u.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">{u.username}</h2>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-white/90 sm:justify-start">
                  <span className="rounded-full bg-black/20 px-2 py-0.5 font-semibold">
                    {tier.emoji} {tier.label}
                  </span>
                  <span>Rating: <strong>{u.rating}</strong></span>
                  <span>Level: <strong>{u.level}</strong></span>
                  <span>Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-4">
            {/* XP bar */}
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Level {xp.level}</span>
              <span className="text-muted-foreground">
                {xp.current} / {xp.needed} XP to level {xp.level + 1}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="xp-bar h-full"
                style={{ width: `${xp.pct}%` }}
              />
            </div>
            {/* Next tier hint */}
            {next && (
              <div className="mt-2 text-center text-xs text-muted-foreground">
                <span className="text-foreground">{next.min - u.rating} rating points to <strong style={{ color: next.color }}>{next.emoji} {next.label}</strong></span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stat cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 fade-in-up">
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Rating"
            value={u.rating.toString()}
            sub={`${tier.label} tier`}
            tone="bg-emerald-500/10 text-emerald-400"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Win rate"
            value={`${winRate}%`}
            sub={`${u.wins}W · ${u.losses}L · ${u.draws}D`}
            tone="bg-sky-500/10 text-sky-400"
          />
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Total games"
            value={totalGames.toString()}
            sub={`${u.wins} wins`}
            tone="bg-amber-500/10 text-amber-400"
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Puzzles solved"
            value={u.puzzlesSolved.toString()}
            sub="keep it up!"
            tone="bg-violet-500/10 text-violet-400"
          />
        </div>

        {/* Recent games */}
        <Card className="fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Recent games
            </CardTitle>
            <CardDescription>Your last {data.recentGames.length} completed games.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentGames.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <Swords className="mx-auto mb-2 h-8 w-8 opacity-30" />
                No games yet. Hit the Play Online tab to find your first opponent!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.recentGames.map((g) => {
                  const isWhite = g.white.id === u.id;
                  const opponent = isWhite ? g.black : g.white;
                  let myResult: "win" | "loss" | "draw";
                  if (g.result === "draw") myResult = "draw";
                  else if (
                    (g.result === "white" && isWhite) ||
                    (g.result === "black" && !isWhite)
                  )
                    myResult = "win";
                  else myResult = "loss";

                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between gap-2 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            myResult === "win"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : myResult === "loss"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {myResult === "win" ? "W" : myResult === "loss" ? "L" : "D"}
                        </span>
                        <div>
                          <div className="font-medium text-foreground">
                            vs {opponent.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isWhite ? "White" : "Black"} · {opponent.rating} ·{" "}
                            {g.endedAt && new Date(g.endedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {g.reason ?? g.result}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tier ladder */}
        <div className="mt-6 fade-in-up">
          <div className="mb-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Crown className="h-4 w-4 text-amber-400" />
              Rating ladder
            </h3>
            <p className="text-xs text-muted-foreground">Where you stand on the global ladder. Click a rung for details.</p>
          </div>
          <TierLadder userRating={u.rating} />
        </div>
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
