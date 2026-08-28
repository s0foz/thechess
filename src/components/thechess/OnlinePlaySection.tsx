"use client";

import { useRef, useState } from "react";
import { useOnlineGame } from "@/hooks/use-online-game";
import { useAuth } from "@/hooks/use-auth";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { CapturedPieces } from "@/components/chess/CapturedPieces";
import { LogoMark } from "./Logo";
import { AuthModal } from "./AuthModal";
import { tierForRating, type TierInfo } from "@/lib/thechess/tiers";
import { toast } from "sonner";
import type { EngineSnapshot } from "@/lib/chess/engine";
import type { Square } from "chess.js";
import {
  Swords,
  Loader2,
  X,
  Handshake,
  Flag,
  LogIn,
  Crown,
  Users,
  Zap,
  ShieldCheck,
  CircleDot,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

export function OnlinePlaySection() {
  const { user, isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  // Keep the human's color in a ref so the onGameEnd callback can read it
  // without re-binding every render (avoids stale-closure / missing-toast issues).
  const humanColorRef = useRef<"w" | "b">("w");

  const online = useOnlineGame({
    enabled: !!user,
    user: user
      ? { id: user.id, username: user.username, rating: user.rating }
      : undefined,
    onGameEnd: (result, reason) => {
      const humanWon =
        humanColorRef.current === "w"
          ? result === "white"
          : result === "black";
      if (result === "draw") {
        toast.info("Draw", { description: formatReason(reason) });
      } else if (humanWon) {
        toast.success("You won!", {
          description: `${formatReason(reason)} · rating update applied`,
        });
      } else {
        toast.error("You lost", { description: formatReason(reason) });
      }
    },
  });

  const { state } = online;
  // Sync the ref whenever the color changes.
  if (state.color) humanColorRef.current = state.color;

  const handlePlayClick = () => {
    if (!isAuthenticated) {
      setAuthMode("signup");
      setAuthOpen(true);
      return;
    }
    online.joinQueue();
  };

  // ─── Not signed in ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <section className="px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-5xl fade-in-up">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              {/* Hero / pitch */}
              <div className="flex flex-col justify-center gap-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/20">
                  <CircleDot className="h-3 w-3 animate-pulse" />
                  Live multiplayer
                </div>
                <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                  Play chess in real time against opponents worldwide.
                </h1>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Sign up to climb the rating ladder, earn XP, and challenge players at your skill
                  level. Every game counts — your Elo updates the moment the game ends.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="lg" className="gap-2" onClick={() => setAuthOpen(true)}>
                    <LogIn className="h-4 w-4" />
                    Create free account
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthOpen(true);
                    }}
                  >
                    Sign in
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No email required · username-only signup · takes 10 seconds
                </p>
              </div>

              {/* Feature cards */}
              <div className="grid gap-3">
                <FeatureRow
                  icon={<ShieldCheck className="h-4 w-4" />}
                  tone="text-emerald-400 bg-emerald-500/10"
                  title="Rating-based matchmaking"
                  desc="Pair with players within ±150 of your rating. Fair games, every time."
                />
                <FeatureRow
                  icon={<Zap className="h-4 w-4" />}
                  tone="text-amber-400 bg-amber-500/10"
                  title="Instant pairing"
                  desc="Average wait time under 15 seconds during peak hours."
                />
                <FeatureRow
                  icon={<Crown className="h-4 w-4" />}
                  tone="text-violet-400 bg-violet-500/10"
                  title="Progress that sticks"
                  desc="Earn XP, level up, and climb from Bronze to Grandmaster."
                />
                <FeatureRow
                  icon={<Users className="h-4 w-4" />}
                  tone="text-sky-400 bg-sky-500/10"
                  title="Global leaderboard"
                  desc="See where you rank against every player on thechess."
                />
              </div>
            </div>
          </div>
        </section>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
      </>
    );
  }

  // ─── Queueing ────────────────────────────────────────────────────
  if (state.status === "idle" || state.status === "queueing") {
    return (
      <section className="px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl fade-in-up">
          {state.status === "queueing" ? (
            <QueueingPanel
              queuePosition={state.queuePosition}
              onCancel={online.leaveQueue}
            />
          ) : (
            <IdlePanel
              username={user?.username ?? ""}
              rating={user?.rating ?? 0}
              onFind={handlePlayClick}
            />
          )}
        </div>
      </section>
    );
  }

  // ─── Playing / ended ─────────────────────────────────────────────
  const orientation = state.color ?? "w";
  const snapshot: EngineSnapshot | null = state.snapshot;
  const isHumanTurn =
    snapshot?.turn === state.color && state.status === "playing";

  const opponentTier = state.opponent ? tierForRating(state.opponent.rating) : null;
  const myTier = tierForRating(user?.rating ?? 0);

  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_340px]">
        {/* Board column */}
        <div className="flex flex-col gap-2 fade-in-up">
          {/* Opponent bar */}
          <PlayerBar
            username={state.opponent?.username ?? "Opponent"}
            rating={state.opponent?.rating ?? 0}
            tier={opponentTier}
            captures={snapshot}
            perspective={orientation}
            isOpponent
            disconnected={state.opponentDisconnected}
            isToMove={snapshot?.turn !== state.color && state.status === "playing"}
            drawOffer={
              state.drawOfferedBy && state.drawOfferedBy !== orientation
                ? {
                    onAccept: () => online.respondDraw(true),
                    onDecline: () => online.respondDraw(false),
                  }
                : null
            }
          />

          {/* Board */}
          {snapshot && (
            <div className="w-full">
              <ChessBoard
                snapshot={snapshot}
                orientation={orientation}
                interactive={state.status === "playing" && !!isHumanTurn}
                onMove={(from: Square, to: Square) => online.makeMove(from, to)}
                myPieceSkin={user?.activePieceSkin as any}
                boardSkin={user?.activeBoardSkin as any}
              />
            </div>
          )}

          {/* My bar */}
          <PlayerBar
            username={user?.username ?? "You"}
            rating={user?.rating ?? 0}
            tier={myTier}
            captures={snapshot}
            perspective={orientation}
            isOpponent={false}
            disconnected={false}
            isToMove={!!isHumanTurn}
            actions={
              state.status === "playing"
                ? {
                    onDraw: online.offerDraw,
                    drawOfferedByMe: state.drawOfferedBy === orientation,
                    onResign: () => {
                      if (window.confirm("Resign this game? You will lose rating.")) {
                        online.resign();
                      }
                    },
                  }
                : null
            }
          />

          {/* Mobile-only move history */}
          {state.status === "playing" && snapshot && (
            <div className="lg:hidden">
              <MoveHistory moves={snapshot.moves} />
            </div>
          )}
        </div>

        {/* Side panel (desktop) */}
        <aside className="flex flex-col gap-4 fade-in-up">
          {state.status === "ended" ? (
            <EndPanel
              result={state.result}
              reason={state.reason}
              humanColor={orientation}
              ratingBefore={user?.rating ?? 0}
              onReset={online.reset}
            />
          ) : (
            <>
              <GameInfoCard
                opponent={state.opponent?.username ?? "Opponent"}
                opponentRating={state.opponent?.rating ?? 0}
                opponentTier={opponentTier}
                isHumanTurn={!!isHumanTurn}
                moveCount={snapshot?.moves.length ?? 0}
                inCheck={snapshot?.inCheck ?? false}
              />
              {snapshot && <MoveHistory moves={snapshot.moves} />}
            </>
          )}
        </aside>
      </div>
    </section>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function formatReason(reason: string | null): string {
  switch (reason) {
    case "checkmate": return "Checkmate";
    case "resign": return "By resignation";
    case "draw_agreement": return "Draw agreed";
    case "stalemate": return "Stalemate";
    case "threefold": return "Threefold repetition";
    case "insufficient": return "Insufficient material";
    case "fifty-move": return "Fifty-move rule";
    case "abandon": return "Opponent abandoned";
    default: return reason ?? "Game over";
  }
}

function FeatureRow({
  icon,
  tone,
  title,
  desc,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card/50 p-3">
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${tone}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function IdlePanel({
  username,
  rating,
  onFind,
}: {
  username: string;
  rating: number;
  onFind: () => void;
}) {
  const tier = tierForRating(rating);
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-br tier-${tier.id} px-6 py-5`}>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/20 text-lg font-bold text-white backdrop-blur">
              {username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-bold text-white">{username}</div>
              <div className="text-xs text-white/85">
                {tier.label} · {rating} rating
              </div>
            </div>
          </div>
        </div>
        <CardContent className="space-y-4 py-6">
          <div>
            <div className="text-sm font-semibold text-foreground">Quick match</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Paired with a player within ±150 of your rating. Range widens to ±300 after 30s.
            </div>
          </div>
          <Button
            size="lg"
            className="w-full gap-2 text-base"
            onClick={onFind}
          >
            <Swords className="h-5 w-5" />
            Find a game
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col justify-between bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            How it works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 py-0 pb-4 text-xs text-muted-foreground">
          <Step n={1} text="Click 'Find a game' to enter the queue." />
          <Step n={2} text="You're matched with a similar-rated opponent." />
          <Step n={3} text="Play a full game with resign & draw options." />
          <Step n={4} text="Your rating & XP update automatically." />
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
        {n}
      </div>
      <span>{text}</span>
    </div>
  );
}

function QueueingPanel({
  queuePosition,
  onCancel,
}: {
  queuePosition: number;
  onCancel: () => void;
}) {
  return (
    <Card className="overflow-hidden border-emerald-500/30">
      <CardContent className="flex flex-col items-center gap-5 py-12">
        <div className="relative">
          <LogoMark size={56} className="float" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">Finding opponent…</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Matching by rating. {queuePosition > 1 ? `${queuePosition} players in queue.` : "You're next."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Typical wait: 5–15 seconds</span>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}

function PlayerBar({
  username,
  rating,
  tier,
  captures,
  perspective,
  isOpponent,
  disconnected,
  isToMove,
  drawOffer,
  actions,
}: {
  username: string;
  rating: number;
  tier: TierInfo;
  captures: EngineSnapshot | null;
  perspective: "w" | "b";
  isOpponent: boolean;
  disconnected: boolean;
  isToMove: boolean;
  drawOffer?: { onAccept: () => void; onDecline: () => void } | null;
  actions?: {
    onDraw: () => void;
    drawOfferedByMe: boolean;
    onResign: () => void;
  } | null;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors ${
        isToMove
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-border bg-card/40"
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white tier-${tier.id}`}
        >
          {username.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{username}</span>
            {disconnected && (
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
                disconnected
              </span>
            )}
            {isToMove && (
              <span className="hidden items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 sm:inline-flex">
                <Clock className="h-2.5 w-2.5" />
                to move
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <span style={{ color: tier.color }}>{tier.label}</span>
            <span className="mx-1">·</span>
            {rating}
          </div>
        </div>
      </div>

      {/* Captured pieces (compact) */}
      {captures && (
        <div className="hidden min-w-0 max-w-[180px] flex-shrink sm:block">
          <CapturedPieces
            capturedByWhite={captures.capturedByWhite}
            capturedByBlack={captures.capturedByBlack}
            perspective={perspective}
          />
        </div>
      )}

      {/* Draw offer response */}
      {drawOffer && (
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={drawOffer.onAccept} className="h-7 gap-1 px-2 text-xs">
            <Handshake className="h-3 w-3" />
            Accept draw
          </Button>
          <Button size="sm" variant="ghost" onClick={drawOffer.onDecline} className="h-7 px-2 text-xs">
            Decline
          </Button>
        </div>
      )}

      {/* My action buttons */}
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={actions.onDraw}
            disabled={actions.drawOfferedByMe}
            className="h-7 gap-1 px-2 text-xs"
          >
            <Handshake className="h-3 w-3" />
            {actions.drawOfferedByMe ? "Offered" : "Draw"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={actions.onResign}
            className="h-7 gap-1 px-2 text-xs text-red-500 hover:bg-red-500/10"
          >
            <Flag className="h-3 w-3" />
            Resign
          </Button>
        </div>
      )}
    </div>
  );
}

function GameInfoCard({
  opponent,
  opponentRating,
  opponentTier,
  isHumanTurn,
  moveCount,
  inCheck,
}: {
  opponent: string;
  opponentRating: number;
  opponentTier: TierInfo | null;
  isHumanTurn: boolean;
  moveCount: number;
  inCheck: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live game
          </div>
          <div className="mt-0.5 text-sm font-semibold text-foreground">
            vs {opponent}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              ({opponentRating} · {opponentTier?.label})
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              inCheck
                ? "bg-red-500/15 text-red-400"
                : isHumanTurn
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {inCheck ? "Check!" : isHumanTurn ? "Your move" : "Opponent"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Move {Math.floor(moveCount / 2) + 1}
          </span>
        </div>
      </div>
    </div>
  );
}

function EndPanel({
  result,
  reason,
  humanColor,
  ratingBefore,
  onReset,
}: {
  result: "white" | "black" | "draw" | null;
  reason: string | null;
  humanColor: "w" | "b";
  ratingBefore: number;
  onReset: () => void;
}) {
  if (!result) return null;
  const humanWon = humanColor === "w" ? result === "white" : result === "black";
  const isDraw = result === "draw";
  const title = isDraw ? "Draw" : humanWon ? "Victory" : "Defeat";
  const tone = isDraw
    ? "from-amber-500/15 to-amber-500/5 border-amber-500/30"
    : humanWon
    ? "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30"
    : "from-red-500/15 to-red-500/5 border-red-500/30";
  const icon = isDraw ? (
    <Handshake className="h-10 w-10" />
  ) : humanWon ? (
    <Crown className="h-10 w-10" />
  ) : (
    <Flag className="h-10 w-10" />
  );
  const iconColor = isDraw
    ? "text-amber-400"
    : humanWon
    ? "text-emerald-400"
    : "text-red-400";

  // Estimate rating change (K=32, expected vs equal-rated opponent = 0.5).
  const estDelta = isDraw ? 0 : humanWon ? +16 : -16;

  return (
    <Card className={`bg-gradient-to-br ${tone} pop-in`}>
      <CardContent className="flex flex-col items-center gap-3 py-8">
        <div className={iconColor}>{icon}</div>
        <h3 className="text-2xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{formatReason(reason)}</p>

        {!isDraw && (
          <div className="flex items-center gap-3 rounded-lg bg-background/60 px-4 py-2">
            <span className="text-xs text-muted-foreground">{ratingBefore}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span
              className={`text-sm font-bold ${
                humanWon ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {ratingBefore + estDelta}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                humanWon
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {humanWon ? "+" : ""}{estDelta}
            </span>
          </div>
        )}

        <Button onClick={onReset} className="mt-3 gap-2">
          <RefreshCw className="h-4 w-4" />
          Find new game
        </Button>
      </CardContent>
    </Card>
  );
}
