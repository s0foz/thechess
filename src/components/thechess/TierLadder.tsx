"use client";

import { useState } from "react";
import { TIERS, type TierInfo } from "@/lib/thechess/tiers";
import { useAuth } from "@/hooks/use-auth";
import { tierForRating } from "@/lib/thechess/tiers";
import { ChevronUp, ChevronDown, You } from "./LadderIcons";

interface TierLadderProps {
  /** Optional override for the current user's rating (defaults to auth user). */
  userRating?: number;
  /** Called when the user clicks a tier — useful for jumping to play. */
  onSelectTier?: (tier: TierInfo) => void;
}

/**
 * Interactive vertical rating ladder — Grandmaster at the top, Bronze at the
 * bottom. Each rung shows the tier name, rating range, and a fill bar that
 * represents how much of the ladder the tier occupies. The current user's
 * position is marked with a glowing pin on the appropriate rung.
 */
export function TierLadder({ userRating, onSelectTier }: TierLadderProps) {
  const { user } = useAuth();
  const rating = userRating ?? user?.rating ?? 0;
  const currentTier = tierForRating(rating);
  const [expanded, setExpanded] = useState<string | null>(currentTier.id);

  // Display top-to-bottom: Grandmaster first, Bronze last.
  const tiersTopDown = [...TIERS].reverse();

  // Compute a width for each tier rung proportional to its rating span.
  // Bronze covers 0-1199 (1200 wide), others are ~300 wide. We display all
  // the same height but show a "span" indicator.
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
      {/* Ladder header */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-zinc-900 to-zinc-950 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your position
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold" style={{ color: currentTier.color }}>
              {rating}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-sm font-semibold" style={{ color: currentTier.color }}>
              {currentTier.label}
            </span>
          </div>
        </div>
        {user && (
          <div className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            ● Live
          </div>
        )}
      </div>

      {/* Ladder rungs */}
      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute bottom-4 left-[28px] top-4 w-0.5 bg-gradient-to-b from-red-500/40 via-violet-500/30 to-amber-500/30 sm:left-[36px]" />

        <ul className="relative space-y-0.5 p-2">
          {tiersTopDown.map((tier, idx) => {
            const isCurrent = tier.id === currentTier.id;
            const isPassed = rating > tier.max;
            const isOpen = expanded === tier.id;
            const isTopTier = idx === 0;
            const isBottomTier = idx === tiersTopDown.length - 1;

            // Position of the user within this tier, as a percentage 0..100.
            let positionPct = 0;
            if (isCurrent && tier.max !== 9999) {
              positionPct = Math.max(
                0,
                Math.min(
                  100,
                  ((rating - tier.min) / (tier.max - tier.min)) * 100,
                ),
              );
            } else if (isCurrent && tier.max === 9999) {
              // Grandmaster — just put it at top.
              positionPct = 100;
            }

            return (
              <li key={tier.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : tier.id)}
                  className={`relative flex w-full items-center gap-3 rounded-lg py-2 pl-2 pr-3 text-left transition-colors sm:gap-4 sm:pl-3 ${
                    isCurrent
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-muted/40"
                  }`}
                >
                  {/* Rung marker on the rail */}
                  <span className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center sm:h-9 sm:w-9">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white tier-${tier.id} sm:h-9 sm:w-9 sm:text-xs ${
                        isCurrent ? "ring-2 ring-white/40 ring-offset-2 ring-offset-background" : ""
                      }`}
                      style={{
                        boxShadow: isCurrent ? `0 0 12px ${tier.color}` : undefined,
                      }}
                    >
                      {tier.max === 9999 ? "★" : idx + 1}
                    </span>
                  </span>

                  {/* Rung content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold sm:text-base"
                          style={{ color: tier.color }}
                        >
                          {tier.label}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            <You className="h-2.5 w-2.5" />
                            You
                          </span>
                        )}
                        {isPassed && (
                          <span className="text-[10px] text-muted-foreground">
                            ✓ cleared
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground sm:text-xs">
                        {tier.min}–{tier.max === 9999 ? "∞" : tier.max}
                      </span>
                    </div>

                    {/* Progress bar showing position within tier */}
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: isCurrent
                            ? `${positionPct}%`
                            : isPassed
                            ? "100%"
                            : "0%",
                          backgroundColor: tier.color,
                          boxShadow: isCurrent ? `0 0 8px ${tier.color}80` : undefined,
                        }}
                      />
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="mt-2 space-y-1.5 text-xs text-muted-foreground pop-in">
                        <p>{getTierDescription(tier.id)}</p>
                        {isCurrent ? (
                          <p className="font-medium text-foreground">
                            {tier.max === 9999
                              ? "You're at the top of the ladder!"
                              : `${tier.max + 1 - rating} rating points to reach ${
                                  TIERS[TIERS.findIndex((t) => t.id === tier.id) + 1]?.label ?? "the next tier"
                                }.`}
                          </p>
                        ) : isPassed ? (
                          <p>You&apos;ve cleared this tier — keep climbing!</p>
                        ) : (
                          <p>
                            {tier.min - rating} rating points to reach this tier.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expand indicator */}
                  <span className="flex-shrink-0 self-start text-muted-foreground">
                    {isOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border bg-muted/20 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Win ranked games to climb. Lose and you drop. Every match counts.
        </p>
      </div>
    </div>
  );
}

function getTierDescription(id: string): string {
  switch (id) {
    case "bronze":
      return "Just starting out. Learn the basics and develop your opening repertoire.";
    case "silver":
      return "You understand the fundamentals. Time to study tactics and basic endgames.";
    case "gold":
      return "Solid club player. Your positional understanding is starting to take shape.";
    case "platinum":
      return "Strong tournament player. You can punish most opening mistakes.";
    case "diamond":
      return "Advanced player. Your calculation and endgame technique are sharp.";
    case "master":
      return "Expert level. Few players reach this tier — your moves are precise.";
    case "grandmaster":
      return "The summit. Reserved for the strongest players on thechess.";
    default:
      return "";
  }
}
