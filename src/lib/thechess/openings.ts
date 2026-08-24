// Common chess openings — names, ECO codes, principal moves, and brief
// explanations. This is general chess knowledge (not proprietary content).

export interface Opening {
  id: string;
  name: string;
  eco: string;
  moves: string[]; // in SAN, starting with 1. e4 etc.
  pgnMoves: string; // e.g. "1. e4 e5 2. Nf3 Nc6 3. Bb5"
  sideToMoveAfter: "w" | "b"; // whose turn after the moves
  fenAfter: string; // FEN after the moves
  whiteIdeas: string[];
  blackIdeas: string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const OPENINGS: Opening[] = [
  {
    id: "ruy-lopez",
    name: "Ruy Lopez (Spanish)",
    eco: "C60-C99",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    pgnMoves: "1. e4 e5 2. Nf3 Nc6 3. Bb5",
    sideToMoveAfter: "b",
    fenAfter: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    whiteIdeas: [
      "Pressure the c6 knight, which defends the e5 pawn indirectly.",
      "Castle kingside (Bb5+a4+O-O builds the classic 'Spanish structure').",
      "Play c3 and d4 to challenge the center, gaining space.",
    ],
    blackIdeas: [
      "Defend e5 with a6 then Bb4 or d6, depending on variation.",
      "Counterattack with the Marshall Attack (..d6 then ..d5).",
      "Trade the light-squared bishop to weaken White's queenside.",
    ],
    description:
      "One of the oldest and most respected openings in chess. White pressures Black's c6-knight — the defender of e5 — and slowly builds a long-term positional edge. Famous practitioners include Morphy, Capablanca, Kasparov, and Carlsen.",
    difficulty: "intermediate",
  },
  {
    id: "italian",
    name: "Italian Game",
    eco: "C50-C59",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    pgnMoves: "1. e4 e5 2. Nf3 Nc6 3. Bc4",
    sideToMoveAfter: "b",
    fenAfter: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    whiteIdeas: [
      "Aim the bishop at f7 — the weakest square in Black's camp.",
      "Build a quick attack with c3, d3, O-O, and Ng5/Bxf7+ tactics.",
      "Slow build-up with the quiet 'Giuoco Pianissimo' (c3, d3, h3).",
    ],
    blackIdeas: [
      "Counter with ..Nf6 then challenge the center with ..d5.",
      "Play the Two Knights Defense: 3..Nf6 4. Ng5 d5 5. exd5 Na5 (the main line).",
      "Or the Hungarian Defense 3..Be7, avoiding the sharp lines.",
    ],
    description:
      "The Italian Game is one of the oldest recorded openings and a favorite among club players. It leads to open, tactical positions where both sides fight for the center and pressure f7/f2. Revived at the top level by Carlsen and Caruana around 2018.",
    difficulty: "beginner",
  },
  {
    id: "sicilian",
    name: "Sicilian Defense",
    eco: "B20-B99",
    moves: ["e4", "c5"],
    pgnMoves: "1. e4 c5",
    sideToMoveAfter: "w",
    fenAfter: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 2 2",
    whiteIdeas: [
      "Open the position with d4 after cxd4 — aim for the Open Sicilian.",
      "Use the d4 square as an outpost; develop knights to f3 and c3.",
      "Kingside attack with g4-g5 in many variations (e.g., Yugoslav Attack).",
    ],
    blackIdeas: [
      "Trade the c-pawn for White's d-pawn to gain a central majority.",
      "Use the semi-open c-file for the queenside attack (..Rc8, ..Qb6).",
      "Many sharp variations: Najdorf, Dragon, Sveshnikov, Scheveningen.",
    ],
    description:
      "The Sicilian Defense is Black's most popular and combative response to 1.e4. It's asymmetric from move one, leading to unbalanced positions where both sides can play for a win. The Open Sicilian (2.Nf3 then 3.d4) leads to the sharpest play.",
    difficulty: "advanced",
  },
  {
    id: "french",
    name: "French Defense",
    eco: "C00-C19",
    moves: ["e4", "e6"],
    pgnMoves: "1. e4 e6",
    sideToMoveAfter: "w",
    fenAfter: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    whiteIdeas: [
      "Establish a big pawn center with d4-d5.",
      "Use the e5 pawn chain to cramp Black; develop the QB behind it.",
      "Attack on the kingside with f4-f5 or Qg4 ideas.",
    ],
    blackIdeas: [
      "Counterattack the base of White's chain (d4) with ..c5 and ..Qb6.",
      "Trade the 'bad' light-squared bishop via ..b6 and ..Ba6.",
      "Use the c-file after ..cxd4, often play for queenside pressure.",
    ],
    description:
      "The French Defense leads to closed, strategic play where both sides maneuver behind pawn chains. Black accepts a cramped but solid position in exchange for long-term counterplay against White's center. Popularized by Botvinnik, Korchnoi, and Uhlmann.",
    difficulty: "intermediate",
  },
  {
    id: "queens-gambit",
    name: "Queen's Gambit",
    eco: "D06-D69",
    moves: ["d4", "d5", "c4"],
    pgnMoves: "1. d4 d5 2. c4",
    sideToMoveAfter: "b",
    fenAfter: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c6 0 2",
    whiteIdeas: [
      "Build a classical center with cxd5 then e3 + Nf3 + Bd3.",
      "Use the isolated queen pawn (IQP) positions for attacking chances.",
      "Pressure the d5 pawn and develop quickly with Nc3, Bg5, Nf3.",
    ],
    blackIdeas: [
      "Accept the gambit: 2..dxc4 — then ..a6 and ..b5 to hold the pawn.",
      "Decline with 2..e6 (Orthodox), 2..c6 (Slav), or 2..e5 (Albin Counter-Gambit).",
      "Develop the light-squared bishop outside the pawn chain (e.g., ..Bg4 in the Slav).",
    ],
    description:
      "Despite the name, the Queen's Gambit is not a true gambit — Black cannot easily hold the c4 pawn. White offers a wing pawn to gain central superiority. One of the most respectable openings, played by every World Champion.",
    difficulty: "intermediate",
  },
  {
    id: "kings-indian",
    name: "King's Indian Defense",
    eco: "E60-E99",
    moves: ["d4", "Nf6", "c4", "g6"],
    pgnMoves: "1. d4 Nf6 2. c4 g6",
    sideToMoveAfter: "w",
    fenAfter: "rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3",
    whiteIdeas: [
      "Establish a big pawn center with e4 + Nf3 + Bd3 + O-O.",
      "In the classical line, play h3, Be3, Qd2, and g4-g5 for a kingside storm.",
      "Or play the Bayonet Attack: Nf3-d2-c2, g3, Bg2 to assault Black's king.",
    ],
    blackIdeas: [
      "Fianchetto the dark-squared bishop on g7 to aim at the center.",
      "Counterattack with ..e5 or ..c5 to undermine White's pawn chain.",
      "Launch a kingside pawn storm: ..f5, ..g5, ..h5 (especially in the Mar Del Plata).",
    ],
    description:
      "The King's Indian Defense is a hypermodern opening: Black lets White build a big center, then attacks it from the flanks. The resulting positions are sharp and double-edged, with both sides attacking the enemy king. Championed by Fischer and Kasparov.",
    difficulty: "advanced",
  },
  {
    id: "caro-kann",
    name: "Caro-Kann Defense",
    eco: "B10-B19",
    moves: ["e4", "c6"],
    pgnMoves: "1. e4 c6",
    sideToMoveAfter: "w",
    fenAfter: "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2",
    whiteIdeas: [
      "Advance with d4-d5 to cramp Black and gain space.",
      "Use the e5 outpost for the knight (Ne1-d3-c5 ideas in the Advance).",
      "In the Classical variation, develop with Nf3, Bd3, O-O, and pressure the kingside.",
    ],
    blackIdeas: [
      "Develop the light-squared bishop before ..e6 — the key advantage over the French.",
      "Counter with ..c5 and ..cxd4 to open the c-file.",
      "In the Advance variation, play ..Bf5 then ..e6 to solidify the position.",
    ],
    description:
      "The Caro-Kann is a solid, sound defense that fixes the problems of the French (the bad light-squared bishop). Black accepts a slightly passive position in exchange for structural soundness and endgame viability. A favorite of positional players like Karpov and Carlsen.",
    difficulty: "intermediate",
  },
  {
    id: "scandinavian",
    name: "Scandinavian Defense",
    eco: "B01",
    moves: ["e4", "d5"],
    pgnMoves: "1. e4 d5",
    sideToMoveAfter: "w",
    fenAfter: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2",
    whiteIdeas: [
      "Take the pawn: 2. exd5 — then either Qxd5 (modern) or Nf6 (old).",
      "Develop quickly with Nf3, Bc4, d4, and exploit the early queen.",
      "In the ..Qxd5 lines, gain a tempo with Nc3 to kick the queen around.",
    ],
    blackIdeas: [
      "After 2..Qxd5 3. Nc3, retreat with ..Qa5 or ..Qd6 to keep the queen active but safe.",
      "Develop with ..Nf6, ..c6, ..Bg4, ..e6 — solid structure with no weaknesses.",
      "In the ..Nf6 line (Icelandic-Palac), play gambit-style chess with sharp tactics.",
    ],
    description:
      "The Scandinavian (also called the Center-Counter) immediately challenges White's center with 1..d5. Black usually accepts giving up a tempo to develop the queen early. The modern ..Qa5 and ..Qd6 lines have made it respectable at the top level.",
    difficulty: "beginner",
  },
];
