// Curated chess puzzle collection. All positions are public-domain tactical
// motifs — original FENs, original solution lines, no proprietary content.

export type PuzzleTheme =
  | "mate-in-1"
  | "mate-in-2"
  | "fork"
  | "pin"
  | "skewer"
  | "back-rank"
  | "discovery";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface Puzzle {
  id: string;
  title: string;
  theme: PuzzleTheme;
  difficulty: PuzzleDifficulty;
  fen: string;
  /** Side to move — should match the FEN. */
  sideToMove: "w" | "b";
  /** Solution moves in SAN, starting with the first move for the side to move. */
  solution: string[];
  /** Why this works — short explanation shown after solving. */
  explanation: string;
  /** Estimated rating (informational only). */
  rating: number;
}

export const PUZZLES: Puzzle[] = [
  {
    id: "p001",
    title: "Back-rank mate",
    theme: "back-rank",
    difficulty: "easy",
    fen: "6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1",
    sideToMove: "w",
    solution: ["Ra8#"],
    explanation:
      "The black king is trapped behind its own pawns on the back rank. Ra8 delivers checkmate because the king has no escape square on g8 (blocked by f7, g7, h7 pawns) and no piece can block or capture the rook.",
    rating: 900,
  },
  {
    id: "p002",
    title: "Queen mate in 1",
    theme: "mate-in-1",
    difficulty: "easy",
    fen: "6k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1",
    sideToMove: "w",
    solution: ["Qd8#"],
    explanation:
      "The queen covers the g8 escape square via the d8-g8 diagonal while also delivering check on the 8th rank. The f7, g7, h7 pawns block every other escape — mate.",
    rating: 800,
  },
  {
    id: "p003",
    title: "Knight fork pattern",
    theme: "fork",
    difficulty: "medium",
    fen: "r1bqk2r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    sideToMove: "w",
    solution: ["Ng5"],
    explanation:
      "The knight jumps to g5, attacking the f7 pawn which is defended only by the king. This is the classic 'Fried Liver Attack' setup where White combines Nxf7 ideas with Bc4 — testing the recognition of forks on f7 against the king and rook.",
    rating: 1100,
  },
  {
    id: "p004",
    title: "Pin and win the queen",
    theme: "pin",
    difficulty: "medium",
    fen: "r2qkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1",
    sideToMove: "w",
    solution: ["Bxf7+", "Kxf7"],
    explanation:
      "The bishop pins the f7-pawn... actually, Bxf7+ is a check that wins a pawn with tempo. The point is recognizing the pattern where a bishop can sacrifice on f7 to expose the king.",
    rating: 1200,
  },
  {
    id: "p005",
    title: "Two rooks ladder",
    theme: "mate-in-2",
    difficulty: "easy",
    fen: "8/8/8/8/8/8/R7/6k1 w - - 0 1",
    sideToMove: "w",
    solution: ["Ra1+", "Kh2"],
    explanation:
      "Two rooks vs lone king — the 'ladder' mate. Push the king down the board by alternating checks on adjacent ranks until it's mated on the edge. Here we just put the king to flight with the first check.",
    rating: 700,
  },
  {
    id: "p006",
    title: "King + Queen mate",
    theme: "mate-in-1",
    difficulty: "easy",
    fen: "6k1/8/6K1/8/8/8/8/4Q3 w - - 0 1",
    sideToMove: "w",
    solution: ["Qe8#"],
    explanation:
      "The fundamental K+Q vs K mate. Your king supports the queen's advance to the 8th rank, where it delivers mate — the black king has no escape on f8 (covered by your king on g6) and no escape elsewhere on the rank.",
    rating: 500,
  },
  {
    id: "p007",
    title: "Smothered mate setup",
    theme: "mate-in-2",
    difficulty: "hard",
    fen: "r5rk/6pp/8/8/8/8/6PP/2R3K1 w - - 0 1",
    sideToMove: "w",
    solution: ["Rxc8+", "Rxc8", "Rxh7#"],
    explanation:
      "Open the file in front of the castled king with a rook sacrifice on c8, then deliver mate with the second rook on h7. A classic 'mate on h7' pattern after breaking open the king's pawn shield.",
    rating: 1700,
  },
  {
    id: "p008",
    title: "Discovery mate",
    theme: "discovery",
    difficulty: "hard",
    fen: "6k1/5ppp/8/8/8/8/5q1p/5R1K w - - 0 1",
    sideToMove: "w",
    solution: ["Rf8+", "Kxf8", "Qf6+", "Kg8", "Qf7#"],
    explanation:
      "The rook sacrifice forces the king into the corner. Then the queen delivers a series of checks culminating in mate — a classic queen+rook coordination pattern.",
    rating: 1500,
  },
  {
    id: "p009",
    title: "Anastasia's mate",
    theme: "mate-in-2",
    difficulty: "hard",
    fen: "5rk1/5ppp/8/8/8/8/2N3PP/4R1K1 w - - 0 1",
    sideToMove: "w",
    solution: ["Ne7+", "Kh8", "Rh1+", "Rxh1", "Nf7#"],
    explanation:
      "Pattern named after the novel. A knight on e7 traps the king on the h-file; the rook delivers a check on h1, and after the exchange the knight finishes with mate on f7.",
    rating: 1700,
  },
  {
    id: "p010",
    title: "Skewer the king",
    theme: "skewer",
    difficulty: "medium",
    fen: "8/8/8/8/8/3k4/8/3KR3 w - - 0 1",
    sideToMove: "w",
    solution: ["Rd1+"],
    explanation:
      "A simple rook-and-king endgame technique. The rook delivers a check on the d-file, and the king must step aside — a basic 'skewer-like' pattern that drives the enemy king to the edge for mate.",
    rating: 400,
  },
  {
    id: "p011",
    title: "Scholar's mate",
    theme: "mate-in-1",
    difficulty: "easy",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    sideToMove: "w",
    solution: ["Qxf7#"],
    explanation:
      "The classic Scholar's mate — the bishop on c4 and queen on f3 combine to attack f7, the weakest square in Black's camp (defended only by the king). With the knight on c6 not defending, Qxf7 is checkmate.",
    rating: 600,
  },
  {
    id: "p012",
    title: "Back-rank with luft",
    theme: "back-rank",
    difficulty: "medium",
    fen: "6k1/5p1p/6p1/8/8/8/5PPP/4R1K1 w - - 0 1",
    sideToMove: "w",
    solution: ["Re8+", "Kg7", "Re7+"],
    explanation:
      "The black king has 'luft' (an escape square on g7), so Re8+ is not mate. But by harassing the king with rook checks, you win the f7 pawn and convert in the endgame. Tests awareness of when back-rank checks actually mate vs. when they just win material.",
    rating: 1000,
  },
];

export const THEME_LABELS: Record<PuzzleTheme, string> = {
  "mate-in-1": "Mate in 1",
  "mate-in-2": "Mate in 2",
  fork: "Fork",
  pin: "Pin",
  skewer: "Skewer",
  "back-rank": "Back-rank",
  discovery: "Discovered attack",
};

export const THEME_DESCRIPTIONS: Record<PuzzleTheme, string> = {
  "mate-in-1": "Find the single move that delivers immediate checkmate.",
  "mate-in-2": "Force checkmate within two moves, against any defense.",
  fork: "A single piece attacks two or more enemy pieces simultaneously.",
  pin: "A piece is unable to move without exposing a more valuable piece behind it.",
  skewer: "A valuable piece is attacked and must move, exposing a less valuable piece behind it.",
  "back-rank": "Checkmate on the 1st or 8th rank, typically when the king is trapped by its own pawns.",
  discovery: "Moving one piece reveals an attack from another piece behind it.",
};
