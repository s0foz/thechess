"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { tierForRating } from "@/lib/thechess/tiers";
import { Loader2, Trophy, Crown, TrendingUp } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  username: string;
  rating: number;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesSolved: number;
  rank: number;
}

export function LeaderboardSection() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.leaderboard ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="px-4 py-16">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const myEntry = user ? entries.find((e) => e.id === user.id) : null;

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Global Leaderboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Top players by rating. Climb the ladder to reach Grandmaster.
          </p>
        </div>

        {/* Podium */}
        {top3.length === 3 && (
          <div className="mb-6 grid grid-cols-3 gap-2 fade-in-up sm:gap-4">
            <Podium entry={top3[1]} place={2} height="h-32" />
            <Podium entry={top3[0]} place={1} height="h-40" crown />
            <Podium entry={top3[2]} place={3} height="h-28" />
          </div>
        )}

        {/* My rank callout */}
        {myEntry && myEntry.rank > 10 && (
          <Card className="mb-4 border-primary/30 bg-primary/5">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  #{myEntry.rank}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {myEntry.username} (you)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {myEntry.rating} rating · {tierForRating(myEntry.rating).label}
                  </div>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {myEntry.wins}W · {myEntry.losses}L · {myEntry.draws}D
              </span>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard list */}
        <Card className="fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-amber-400" />
              All players
            </CardTitle>
            <CardDescription>{entries.length} ranked players</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {entries.map((e) => {
                const tier = tierForRating(e.rating);
                const isMe = user?.id === e.id;
                const totalGames = e.wins + e.losses + e.draws;
                const winRate = totalGames > 0 ? Math.round((e.wins / totalGames) * 100) : 0;
                return (
                  <div
                    key={e.id}
                    className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                      isMe ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white tier-${tier.id}`}>
                        {e.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          {isMe ? `${e.username} (you)` : e.username}
                          {e.rank <= 3 && (
                            <span className="text-xs">
                              {e.rank === 1 ? "👑" : e.rank === 2 ? "🥈" : "🥉"}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tier.emoji} {tier.label} · L{e.level}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden text-xs text-muted-foreground sm:block">
                        {e.wins}W · {e.losses}L · {e.draws}D · {winRate}%
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground" style={{ color: tier.color }}>
                          {e.rating}
                        </div>
                        <div className="text-[10px] text-muted-foreground">rating</div>
                      </div>
                      <div className="w-6 text-right text-xs font-semibold text-muted-foreground">
                        #{e.rank}
                      </div>
                    </div>
                  </div>
                );
              })}
              {entries.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  No ranked players yet. Be the first!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Podium({
  entry,
  place,
  height,
  crown = false,
}: {
  entry: LeaderboardEntry;
  place: number;
  height: string;
  crown?: boolean;
}) {
  const tier = tierForRating(entry.rating);
  const placeColors: Record<number, string> = {
    1: "from-amber-400 to-amber-600",
    2: "from-zinc-400 to-zinc-600",
    3: "from-orange-700 to-amber-900",
  };
  return (
    <div className="flex flex-col items-center">
      {crown && <Crown className="mb-1 h-6 w-6 text-amber-400 float" />}
      <div className={`flex ${height} w-full flex-col items-center justify-end rounded-t-lg bg-gradient-to-b ${placeColors[place]} p-2 text-center pop-in`}>
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-background/30 text-sm font-bold text-white">
          {entry.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="truncate text-xs font-semibold text-white">{entry.username}</div>
        <div className="text-[10px] text-white/80">{entry.rating}</div>
      </div>
      <div className="w-full rounded-b-md bg-card py-1 text-center text-xs font-bold text-foreground">
        #{place}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{tier.emoji} {tier.label}</div>
    </div>
  );
}
