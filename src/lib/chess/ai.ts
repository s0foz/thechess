import { ChessEngine, PIECE_VALUES, type PieceColor } from "./engine";
import type { Square } from "chess.js";

export type Difficulty = "easy" | "medium" | "hard";

export interface AIConfig {
  difficulty: Difficulty;
  /** Probability (0..1) that the AI picks a random legal move instead of the
   *  best move found. Easy = 0.6, Medium = 0.25, Hard = 0. */
  randomness: number;
  /** Search depth in plies. */
  depth: number;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, AIConfig> = {
  easy: { difficulty: "easy", randomness: 0.55, depth: 2 },
  medium: { difficulty: "medium", randomness: 0.2, depth: 3 },
  hard: { difficulty: "hard", randomness: 0, depth: 3 },
};

// Piece-square tables (from white's perspective). Values encourage central
// control, development, king safety, and pawn advancement.
// Adapted from standard "PeSTO"-style simplified evaluation tables.

const PST_PAWN = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PST_KNIGHT = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const PST_BISHOP = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const PST_ROOK = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const PST_QUEEN = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const PST_KING = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const PST_KING_ENDGAME = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50],
];

const PST: Record<string, number[][]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING,
};

function getPstValue(
  type: string,
  color: PieceColor,
  row: number,
  col: number,
  endgame: boolean,
): number {
  if (type === "k" && endgame) {
    return color === "w"
      ? PST_KING_ENDGAME[row][col]
      : PST_KING_ENDGAME[7 - row][col];
  }
  const table = PST[type];
  if (!table) return 0;
  return color === "w" ? table[row][col] : table[7 - row][col];
}

function isEndgame(engine: ChessEngine): boolean {
  // Simplified: endgame if no queens, or low material on both sides.
  const snap = engine.snapshot();
  let totalMaterial = 0;
  let queens = 0;
  for (const row of snap.board) {
    for (const sq of row) {
      if (!sq) continue;
      if (sq.type === "q") queens++;
      if (sq.type !== "k") totalMaterial += PIECE_VALUES[sq.type];
    }
  }
  return queens === 0 || totalMaterial <= 12;
}

function evaluate(engine: ChessEngine, perspective: PieceColor): number {
  if (engine.isCheckmate()) {
    // Side to move is checkmated -> very bad for them.
    return engine.turn === perspective ? -100000 : 100000;
  }
  if (engine.isStalemate() || engine.isDraw() || engine.isInsufficientMaterial()) {
    return 0;
  }

  const snap = engine.snapshot();
  const endgame = isEndgame(engine);
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = snap.board[r][c];
      if (!sq) continue;
      const material = PIECE_VALUES[sq.type] * 100;
      const positional = getPstValue(sq.type, sq.color, r, c, endgame);
      const total = material + positional;
      score += sq.color === "w" ? total : -total;
    }
  }
  // Convert to perspective-relative score.
  return perspective === "w" ? score : -score;
}

interface SearchResult {
  score: number;
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
}

function orderMoves(moves: ReturnType<ChessEngine["legalMoves"]>) {
  // Captures first (MVV-LVA-ish), then promotions, then the rest.
  return [...moves].sort((a, b) => {
    const scoreA =
      (a.captured ? PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece] : 0) +
      (a.promotion ? 8 : 0);
    const scoreB =
      (b.captured ? PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece] : 0) +
      (b.promotion ? 8 : 0);
    return scoreB - scoreA;
  });
}

function minimax(
  engine: ChessEngine,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  perspective: PieceColor,
): number {
  if (depth === 0 || engine.isGameOver()) {
    return evaluate(engine, perspective);
  }

  const moves = orderMoves(engine.legalMoves());
  if (moves.length === 0) {
    return evaluate(engine, perspective);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const mv of moves) {
      engine.move(mv.from, mv.to, mv.promotion);
      const score = minimax(engine, depth - 1, alpha, beta, false, perspective);
      engine.undo();
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const mv of moves) {
      engine.move(mv.from, mv.to, mv.promotion);
      const score = minimax(engine, depth - 1, alpha, beta, true, perspective);
      engine.undo();
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export interface BestMove {
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
  score: number;
}

export function findBestMove(engine: ChessEngine, config: AIConfig): BestMove | null {
  const moves = engine.legalMoves();
  if (moves.length === 0) return null;

  const perspective = engine.turn;
  const maximizing = true;

  // Random move chance for lower difficulties.
  if (config.randomness > 0 && Math.random() < config.randomness) {
    const mv = moves[Math.floor(Math.random() * moves.length)];
    return { from: mv.from, to: mv.to, promotion: mv.promotion, score: 0 };
  }

  let best: BestMove | null = null;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  const ordered = orderMoves(moves);
  for (const mv of ordered) {
    engine.move(mv.from, mv.to, mv.promotion);
    const score = minimax(engine, config.depth - 1, alpha, beta, !maximizing, perspective);
    engine.undo();
    if (score > bestScore) {
      bestScore = score;
      best = { from: mv.from, to: mv.to, promotion: mv.promotion, score: bestScore };
    }
    alpha = Math.max(alpha, bestScore);
  }

  return best;
}
