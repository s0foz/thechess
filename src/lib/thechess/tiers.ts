// Rating tier helpers for the gamified UI.

export type Tier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster";

export interface TierInfo {
  id: Tier;
  label: string;
  min: number;
  max: number;
  color: string; // tailwind text color hex
  emoji: string;
}

export const TIERS: TierInfo[] = [
  { id: "bronze", label: "Bronze", min: 0, max: 1199, color: "#b45309", emoji: "🥉" },
  { id: "silver", label: "Silver", min: 1200, max: 1499, color: "#64748b", emoji: "🥈" },
  { id: "gold", label: "Gold", min: 1500, max: 1799, color: "#f59e0b", emoji: "🥇" },
  { id: "platinum", label: "Platinum", min: 1800, max: 2099, color: "#06b6d4", emoji: "💎" },
  { id: "diamond", label: "Diamond", min: 2100, max: 2399, color: "#a855f7", emoji: "🔷" },
  { id: "master", label: "Master", min: 2400, max: 2699, color: "#ec4899", emoji: "👑" },
  { id: "grandmaster", label: "Grandmaster", min: 2700, max: 9999, color: "#ef4444", emoji: "🏆" },
];

export function tierForRating(rating: number): TierInfo {
  for (const t of TIERS) {
    if (rating >= t.min && rating <= t.max) return t;
  }
  return TIERS[0];
}

export function nextTier(rating: number): TierInfo | null {
  const current = tierForRating(rating);
  const idx = TIERS.findIndex((t) => t.id === current.id);
  if (idx >= TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

export function levelFromXp(xp: number): number {
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = level * 100;
  }
  return level;
}

export function xpProgress(xp: number): { current: number; needed: number; pct: number; level: number } {
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = level * 100;
  }
  return {
    current: remaining,
    needed: need,
    pct: Math.min(100, (remaining / need) * 100),
    level,
  };
}
