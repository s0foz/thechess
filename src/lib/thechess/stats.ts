// Stats tracking via localStorage. Persists per-user game results and
// puzzle solving history across sessions.

import type { Difficulty } from "@/lib/chess/ai";

export interface GameRecord {
  id: string;
  timestamp: number;
  mode: "ai" | "human";
  playerColor: "w" | "b";
  difficulty?: Difficulty;
  result: "win" | "loss" | "draw";
  moves: number;
  opponentLabel: string;
}

export interface PuzzleRecord {
  id: string; // matches the puzzle's id
  timestamp: number;
  solved: boolean;
  attempts: number;
}

export interface Stats {
  games: GameRecord[];
  puzzles: PuzzleRecord[];
}

const STORAGE_KEY = "thechess:stats:v1";

export function loadStats(): Stats {
  if (typeof window === "undefined") return { games: [], puzzles: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { games: [], puzzles: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.games) || !Array.isArray(parsed.puzzles)) {
      return { games: [], puzzles: [] };
    }
    return parsed as Stats;
  } catch {
    return { games: [], puzzles: [] };
  }
}

export function saveStats(stats: Stats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota errors
  }
}

export function recordGame(
  stats: Stats,
  record: Omit<GameRecord, "id" | "timestamp">,
): Stats {
  const next: Stats = {
    ...stats,
    games: [
      ...stats.games,
      {
        ...record,
        id: `g-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
      },
    ],
  };
  saveStats(next);
  return next;
}

export function recordPuzzle(
  stats: Stats,
  puzzleId: string,
  solved: boolean,
): Stats {
  const existing = stats.puzzles.find((p) => p.id === puzzleId);
  let nextPuzzles: PuzzleRecord[];
  if (existing) {
    nextPuzzles = stats.puzzles.map((p) =>
      p.id === puzzleId
        ? {
            ...p,
            timestamp: Date.now(),
            solved: p.solved || solved,
            attempts: p.attempts + 1,
          }
        : p,
    );
  } else {
    nextPuzzles = [
      ...stats.puzzles,
      {
        id: puzzleId,
        timestamp: Date.now(),
        solved,
        attempts: 1,
      },
    ];
  }
  const next: Stats = { ...stats, puzzles: nextPuzzles };
  saveStats(next);
  return next;
}

export interface StatsSummary {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // 0..1
  byDifficulty: Record<Difficulty, { played: number; wins: number }>;
  puzzlesAttempted: number;
  puzzlesSolved: number;
  puzzleAccuracy: number; // 0..1
  currentStreak: number;
  bestStreak: number;
}

export function summarizeStats(stats: Stats): StatsSummary {
  const gamesPlayed = stats.games.length;
  const wins = stats.games.filter((g) => g.result === "win").length;
  const losses = stats.games.filter((g) => g.result === "loss").length;
  const draws = stats.games.filter((g) => g.result === "draw").length;

  const byDifficulty: Record<Difficulty, { played: number; wins: number }> = {
    easy: { played: 0, wins: 0 },
    medium: { played: 0, wins: 0 },
    hard: { played: 0, wins: 0 },
  };
  for (const g of stats.games) {
    if (g.difficulty && byDifficulty[g.difficulty]) {
      byDifficulty[g.difficulty].played++;
      if (g.result === "win") byDifficulty[g.difficulty].wins++;
    }
  }

  const puzzlesAttempted = stats.puzzles.length;
  const puzzlesSolved = stats.puzzles.filter((p) => p.solved).length;

  let currentStreak = 0;
  for (let i = stats.games.length - 1; i >= 0; i--) {
    const g = stats.games[i];
    if (g.result === "win") currentStreak++;
    else break;
  }
  let bestStreak = 0;
  let running = 0;
  for (const g of stats.games) {
    if (g.result === "win") {
      running++;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }

  return {
    gamesPlayed,
    wins,
    losses,
    draws,
    winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
    byDifficulty,
    puzzlesAttempted,
    puzzlesSolved,
    puzzleAccuracy: puzzlesAttempted > 0 ? puzzlesSolved / puzzlesAttempted : 0,
    currentStreak,
    bestStreak,
  };
}
