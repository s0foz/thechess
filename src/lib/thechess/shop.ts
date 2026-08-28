// Shop catalog: piece skins, board skins, and titles.
// Each item has a cost in "pieces" (the in-game currency earned by capturing).

export type PieceSkinId =
  | "default"
  | "neon"
  | "gold"
  | "wood"
  | "crystal";

export type BoardSkinId =
  | "default"
  | "ocean"
  | "sunset"
  | "monochrome";

export interface PieceSkin {
  id: PieceSkinId;
  name: string;
  description: string;
  cost: number;
  // Visual config passed to the Piece SVG component
  palette: {
    white: { body: string; shade: string; base: string; outline: string };
    black: { body: string; shade: string; base: string; outline: string; highlight?: string };
  };
  // Badge gradient for the shop card
  cardGradient: string;
}

export interface BoardSkin {
  id: BoardSkinId;
  name: string;
  description: string;
  cost: number;
  light: string; // light square color
  dark: string;  // dark square color
  cardGradient: string;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  cost: number;
  // Tailwind text color class for the title text
  color: string;
  // Requirement: minimum rating to buy (optional)
  minRating?: number;
}

export const PIECE_SKINS: PieceSkin[] = [
  {
    id: "default",
    name: "Classic Ivory",
    description: "The default thechess set. Clean ivory vs charcoal.",
    cost: 0,
    palette: {
      white: { body: "#fafaf9", shade: "#d6d3d1", base: "#e7e5e4", outline: "#1c1917" },
      black: { body: "#1c1917", shade: "#292524", base: "#0c0a09", outline: "#0c0a09", highlight: "#44403c" },
    },
    cardGradient: "from-stone-100 to-stone-300",
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Cyberpunk vibes. Emerald and magenta with glow filters.",
    cost: 250,
    palette: {
      white: { body: "#10b981", shade: "#047857", base: "#064e3b", outline: "#34d399" },
      black: { body: "#ec4899", shade: "#be185d", base: "#500724", outline: "#f9a8d4", highlight: "#f472b6" },
    },
    cardGradient: "from-emerald-400 to-pink-500",
  },
  {
    id: "gold",
    name: "Royal Gold",
    description: "Polished 24k gold for both sides. A statement of wealth.",
    cost: 500,
    palette: {
      white: { body: "#fde68a", shade: "#f59e0b", base: "#b45309", outline: "#92400e" },
      black: { body: "#a16207", shade: "#713f12", base: "#422006", outline: "#fde68a", highlight: "#fbbf24" },
    },
    cardGradient: "from-amber-300 to-yellow-600",
  },
  {
    id: "wood",
    name: "Hand-Carved Wood",
    description: "Traditional wooden pieces. Like your grandpa's set.",
    cost: 150,
    palette: {
      white: { body: "#d6c4a0", shade: "#a89071", base: "#8b7355", outline: "#5c4a32" },
      black: { body: "#4a2c1a", shade: "#3a2014", base: "#2a1810", outline: "#8b5a3c", highlight: "#6b4226" },
    },
    cardGradient: "from-amber-200 to-amber-800",
  },
  {
    id: "crystal",
    name: "Crystal",
    description: "Translucent crystal with shimmer. Premium aesthetic.",
    cost: 750,
    palette: {
      white: { body: "#e0f2fe", shade: "#bae6fd", base: "#7dd3fc", outline: "#0284c7" },
      black: { body: "#312e81", shade: "#1e1b4b", base: "#0f0a2e", outline: "#818cf8", highlight: "#6366f1" },
    },
    cardGradient: "from-sky-200 to-indigo-700",
  },
];

export const BOARD_SKINS: BoardSkin[] = [
  {
    id: "default",
    name: "Emerald Classic",
    description: "The default thechess board. Warm amber and ivory.",
    cost: 0,
    light: "#fef3c7",
    dark: "#92400e",
    cardGradient: "from-amber-100 to-amber-800",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Cool ocean tones. Sky and navy squares.",
    cost: 100,
    light: "#e0f2fe",
    dark: "#1e3a8a",
    cardGradient: "from-sky-200 to-blue-800",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm pink and purple. Evening vibes.",
    cost: 100,
    light: "#fce7f3",
    dark: "#831843",
    cardGradient: "from-pink-200 to-pink-800",
  },
  {
    id: "monochrome",
    name: "Monochrome",
    description: "Pure black and white. Minimalist.",
    cost: 200,
    light: "#f5f5f4",
    dark: "#1c1917",
    cardGradient: "from-zinc-100 to-zinc-900",
  },
];

export const TITLES: Title[] = [
  {
    id: "rookie",
    name: "Rookie",
    description: "Just getting started. Awarded to all players.",
    cost: 0,
    color: "text-stone-400",
  },
  {
    id: "tactical",
    name: "Tactical Genius",
    description: "For the puzzle solver. Buy once you've solved 5 puzzles.",
    cost: 100,
    color: "text-emerald-400",
  },
  {
    id: "warrior",
    name: "Board Warrior",
    description: "Played 10 ranked games.",
    cost: 150,
    color: "text-amber-400",
  },
  {
    id: "strategist",
    name: "The Strategist",
    description: "Reached 1400 rating.",
    cost: 300,
    color: "text-violet-400",
    minRating: 1400,
  },
  {
    id: "mastermind",
    name: "Mastermind",
    description: "Reached 1800 rating.",
    cost: 500,
    color: "text-pink-400",
    minRating: 1800,
  },
  {
    id: "legend",
    name: "thechess Legend",
    description: "Reached 2200 rating.",
    cost: 1000,
    color: "text-yellow-300",
    minRating: 2200,
  },
];

// Helpers
export function getPieceSkin(id: string): PieceSkin {
  return PIECE_SKINS.find((s) => s.id === id) ?? PIECE_SKINS[0];
}
export function getBoardSkin(id: string): BoardSkin {
  return BOARD_SKINS.find((s) => s.id === id) ?? BOARD_SKINS[0];
}
export function getTitle(id: string | null | undefined): Title | null {
  if (!id) return null;
  return TITLES.find((t) => t.id === id) ?? null;
}

// Piece values for awarding currency on capture.
export const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};
