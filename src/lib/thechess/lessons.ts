// Chess lessons — original educational content covering the rules, basic
// checkmates, opening principles, tactics, and endgame ideas.

export interface LessonSection {
  heading: string;
  body: string[];
}

export interface Lesson {
  id: string;
  title: string;
  category: "rules" | "openings" | "tactics" | "endgames" | "strategy";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string; // estimated reading time
  intro: string;
  sections: LessonSection[];
  keyTakeaways: string[];
}

export const LESSONS: Lesson[] = [
  {
    id: "l-rules",
    title: "How the Pieces Move",
    category: "rules",
    difficulty: "beginner",
    duration: "8 min read",
    intro:
      "Chess is played on an 8x8 board with 64 squares. Each player starts with 16 pieces: one king, one queen, two rooks, two bishops, two knights, and eight pawns. White moves first, then players alternate. The goal is to deliver checkmate — an attack on the enemy king from which it cannot escape.",
    sections: [
      {
        heading: "The King",
        body: [
          "The king moves one square in any direction — horizontally, vertically, or diagonally. It can never move to a square attacked by an enemy piece, and two kings can never stand on adjacent squares.",
          "A special move called castling allows the king and a rook to move simultaneously (see the Castling lesson). The king is never actually captured — the game ends when it has no escape from check.",
        ],
      },
      {
        heading: "The Queen",
        body: [
          "The queen is the most powerful piece. It moves any number of squares in a straight line — horizontally, vertically, or diagonally — as long as its path is not blocked by another piece.",
          "Because of its long range, the queen is best developed after some pawns and minor pieces have cleared the way. Bringing the queen out too early lets the opponent attack it with tempo, forcing you to move it again and again.",
        ],
      },
      {
        heading: "The Rook",
        body: [
          "Rooks move any number of squares horizontally or vertically (but not diagonally). They are most powerful on open files — columns with no pawns — and on the seventh rank, where they can attack pawns and the enemy king.",
          "Two rooks on the seventh rank (the so-called 'pigs on the seventh') often deliver forced mate by alternately giving checks down the rank.",
        ],
      },
      {
        heading: "The Bishop",
        body: [
          "Bishops move any number of squares diagonally. Each side has one light-squared and one dark-squared bishop. A bishop is confined to squares of one color for the entire game.",
          "Bishops are 'long-range' pieces — they shine in open positions with pawn structures that don't block their diagonals. Two bishops working together (the 'bishop pair') are typically worth about half a pawn more than two knights.",
        ],
      },
      {
        heading: "The Knight",
        body: [
          "Knights move in an L-shape: two squares in one direction (horizontal or vertical), then one square perpendicular. Knights are the only pieces that can jump over other pieces.",
          "Knights are 'short-range' pieces, best in closed positions where their ability to jump makes them more mobile than bishops. A knight on an outpost — a square deep in enemy territory that can't be attacked by an enemy pawn — is often worth a rook.",
        ],
      },
      {
        heading: "The Pawn",
        body: [
          "Pawns move forward one square, or two squares from their starting rank. They capture diagonally forward one square — never straight ahead. A pawn that reaches the last rank promotes to a queen, rook, bishop, or knight of the same color (almost always a queen).",
          "Two special pawn rules: en passant (if a pawn advances two squares and lands beside an enemy pawn, the enemy pawn may capture it as if it had moved one square) and the doubled pawn (when one pawn is directly behind another of the same color, both are weakened).",
        ],
      },
    ],
    keyTakeaways: [
      "The king moves one square; the queen combines rook + bishop moves.",
      "Knights jump; bishops are colorbound; rooks need open files.",
      "Pawns capture diagonally, not straight ahead — and they promote on the last rank.",
      "Castling, en passant, and promotion are the three special moves to learn.",
    ],
  },
  {
    id: "l-checkmate-basics",
    title: "Basic Checkmates",
    category: "endgames",
    difficulty: "beginner",
    duration: "10 min read",
    intro:
      "Checkmate is an attack on the king from which it cannot escape by moving, blocking, or capturing. Every chess player must know these fundamental mates by heart — they come up constantly in games and are the foundation of endgame technique.",
    sections: [
      {
        heading: "King + Queen vs King",
        body: [
          "Drive the enemy king to the edge using your queen as a 'wall'. The queen controls a whole rank or file, restricting the king to a smaller and smaller box.",
          "Walk your own king up to support the queen, then deliver mate. The final position is: enemy king on the edge, your queen a knight's move away (with your king protecting it), and the enemy king has no escape.",
          "The most common mistake is stalemate — leaving the enemy king with no legal move but not in check. Always make sure the king is in check OR has at least one square to move to (when you want to keep playing).",
        ],
      },
      {
        heading: "King + Rook vs King",
        body: [
          "Use the rook to cut off ranks/files, driving the enemy king to the edge. Walk your own king up in opposition — that is, with kings facing each other with one square between them, your move forces the enemy king to step aside.",
          "Once the enemy king is on the edge rank, deliver mate by checking with the rook on that rank (with your king controlling the escape squares one rank in).",
          "The key technique is the 'opposition': when the two kings face each other directly with one square between them, the side NOT to move has the opposition. This forces the other king to give ground.",
        ],
      },
      {
        heading: "Two Rooks / 'Ladder' Mate",
        body: [
          "Two rooks can mate a lone king without their own king's help. The technique is the 'ladder': one rook checks on rank 8, the king steps to rank 7; the other rook checks on rank 7, the king steps to rank 6 — repeat until the king is mated on rank 1.",
          "This is also called the 'staircase' mate. The same idea works with two queens, or queen + rook.",
        ],
      },
      {
        heading: "Back-Rank Mate",
        body: [
          "When a king is castled and its three front pawns (f2/g2/h2 or f7/g7/h7) haven't moved, it's trapped on the back rank. A rook or queen checking on that rank is mate — the king can't move forward through its own pawns.",
          "To defend against back-rank mates, create 'luft' (air) — move one of the pawns in front of your king one or two squares forward (commonly h3 or g3) so the king has an escape square on h2 or g2.",
          "Many GM games end in a back-rank mate after one side forgets to make luft. Always check before pushing an attack: does my opponent have luft? Do I?",
        ],
      },
    ],
    keyTakeaways: [
      "Drive the enemy king to the edge — kings are strongest in the center.",
      "Use 'opposition' to walk your king up and force the enemy king back.",
      "Avoid stalemate — leave the enemy king an escape square unless you're mating.",
      "Always make luft after castling to avoid back-rank mates.",
    ],
  },
  {
    id: "l-opening-principles",
    title: "Opening Principles",
    category: "openings",
    difficulty: "beginner",
    duration: "7 min read",
    intro:
      "The opening phase covers the first 10-15 moves. Your goal is NOT to win the game immediately — it's to develop your pieces, control the center, and prepare your king's safety. Violate these principles and even a much weaker player can punish you.",
    sections: [
      {
        heading: "Control the Center",
        body: [
          "The four central squares (e4, d4, e5, d5) are the most important real estate on the board. Pieces in the center control more squares and can swing to either flank quickly.",
          "Open with 1.e4 or 1.d4 to stake a claim in the center. As Black, fight for the center with 1..e5, 1..e6, 1..c5, 1..c6, or 1..Nf6, depending on your style.",
          "Don't push too many pawns in the opening — usually 2-3 pawns in the center is enough. Every pawn push creates a weakness behind it.",
        ],
      },
      {
        heading: "Develop Your Pieces",
        body: [
          "Knights before bishops — knights are shorter-range pieces that benefit from being developed to their best squares (f3/c3 for White; f6/c6 for Black). Bishops have more choices and can wait.",
          "Don't move the same piece twice in the opening unless forced. Each move should bring a new piece into the game.",
          "Don't bring the queen out early — it will be attacked by the opponent's minor pieces, costing you tempo as you retreat it. Develop the queen only after your minor pieces are out and your king is safe.",
        ],
      },
      {
        heading: "Castle Early",
        body: [
          "Castling does two things at once: it tucks your king into a corner and brings a rook toward the center. Aim to castle within the first 7-10 moves.",
          "Generally castle kingside (short) — it's safer and faster. Queenside castling is fine but takes longer and exposes the king to attack on the c-file.",
          "Don't move the pawns in front of your castled king unless you have a clear reason. Each pawn push creates a potential weakness.",
        ],
      },
      {
        heading: "Connect Your Rooks",
        body: [
          "After castling and developing the minor pieces and queen, the rooks should be connected (i.e., the queen and rooks should be on the same rank with nothing between them). Connected rooks control the back rank and are ready for action.",
          "Place rooks on open files or behind your own passed pawns to support their advance. Rooks are the last pieces to develop — they have the longest range and benefit from open positions.",
        ],
      },
      {
        heading: "Don't Give Up Tempi",
        body: [
          "A tempo is one move. In the opening, every tempo matters — the player who develops faster usually gets the first attack. Don't waste moves retreating pieces unless forced.",
          "Don't make threats that the opponent can easily parry while developing. For example, 2.Bb5+ looks active but Black just blocks with ..c6 or ..Nd7, developing a piece while 'defending'.",
        ],
      },
    ],
    keyTakeaways: [
      "Control the center, develop minor pieces, castle early, connect rooks.",
      "Knights before bishops; don't bring the queen out early.",
      "Don't move the same piece twice without good reason.",
      "Every tempo counts — don't waste moves on idle threats.",
    ],
  },
  {
    id: "l-tactics",
    title: "Tactical Motifs",
    category: "tactics",
    difficulty: "intermediate",
    duration: "12 min read",
    intro:
      "Tactics are short-term combinations that win material or deliver mate. They are the heart of chess — even positional play eventually resolves into tactical sequences. The motifs below appear in nearly every game you'll ever play.",
    sections: [
      {
        heading: "The Fork",
        body: [
          "A fork is a single piece attacking two or more enemy pieces at the same time. The opponent can only save one piece, so the other is won. Knights are the most dangerous forkers because their attack can't be blocked.",
          "The classic 'family fork' is a knight check that also attacks the queen and rook. Even the strongest players fall to knight forks — always check where the opponent's knight could land.",
          "Other pieces can fork too: a pawn attacking two pieces on adjacent diagonals, a rook on the seventh rank hitting two pieces on the back rank, etc.",
        ],
      },
      {
        heading: "The Pin",
        body: [
          "A pin is an attack on a piece that cannot move without exposing a more valuable piece behind it. There are two kinds: absolute pins (the piece behind is the king — moving the front piece is illegal) and relative pins (the piece behind is the queen or rook — moving is legal but losing).",
          "Pinned pieces are often effectively 'frozen' — they can't move to defend or attack. A common tactic: attack the pinned piece a third time to win it.",
          "Be careful — relative pins can sometimes be broken with a sudden counterattack. If the piece behind isn't the king, evaluate whether the pin is truly binding.",
        ],
      },
      {
        heading: "The Skewer",
        body: [
          "A skewer is the inverse of a pin: a valuable piece is attacked and must move, exposing a less valuable piece behind it. The most common skewer is a check on the king that forces it to step aside, winning the piece behind.",
          "Bishops, rooks, and queens can skewer along their lines of attack. Long diagonal skewers (e.g., a bishop checking on a8-h1) are especially common.",
        ],
      },
      {
        heading: "The Discovered Attack",
        body: [
          "A discovered attack happens when moving one piece reveals an attack from another piece behind it. If the moving piece also creates a threat (e.g., a check), the opponent has to deal with both — and the discovered attacker captures freely.",
          "A 'discovered check' is when the moving piece uncovers a check from a rook, bishop, or queen behind it. A 'double check' is when BOTH the moving piece AND the uncovered piece deliver check — the king must move, since blocking or capturing one checker doesn't help.",
        ],
      },
      {
        heading: "The Deflection & Overload",
        body: [
          "A deflection forces an enemy piece off a key square or file. The classic: a rook guards the back rank, and you play ..Qxc3+ — if the rook recaptures, it's no longer defending the back rank, and mate follows.",
          "An overload is when a single piece is defending two important things at once. By attacking one, you force it to give up the other. The classic example is a rook defending both the back rank AND a piece on the seventh — attack either to win the other.",
        ],
      },
      {
        heading: "The Zwischenzug (In-Between Move)",
        body: [
          "An in-between move is a forcing move (usually a check or threat) played before recapturing. Instead of an immediate trade, you play a more urgent move first — usually winning more material or improving your position.",
          "Always ask: 'Is there a stronger in-between move before I recapture?' The answer is often yes, and finding these is what separates masters from club players.",
        ],
      },
    ],
    keyTakeaways: [
      "Forks, pins, skewers, and discovered attacks are the four core tactical motifs.",
      "Always check your opponent's last move — what does it threaten, what does it leave undefended?",
      "Before recapturing, look for a stronger in-between move (Zwischenzug).",
      "Tactics decide most games at club level — solve puzzles daily to improve.",
    ],
  },
  {
    id: "l-endgame-opposition",
    title: "King & Pawn Endgames: Opposition",
    category: "endgames",
    difficulty: "intermediate",
    duration: "9 min read",
    intro:
      "King-and-pawn endgames are the most fundamental endgames to master. The key concept is 'opposition' — a battle of kings facing each other where the side NOT to move has the advantage. Understanding opposition is the difference between winning and drawing won positions.",
    sections: [
      {
        heading: "What is Opposition?",
        body: [
          "Two kings are 'in opposition' when they face each other on the same file or rank with one square between them. The player who is NOT to move has the opposition — they can force the opponent's king to step aside and give ground.",
          "Direct opposition: kings two squares apart on the same file/rank. Diagonal opposition: kings on a diagonal two squares apart. Distant opposition: kings three or five squares apart (count the squares between — odd means you have it).",
        ],
      },
      {
        heading: "Using Opposition to Push",
        body: [
          "If you have the opposition, you can advance your king. The opponent's king must step aside (kings can't be adjacent), then you advance to the square they just left.",
          "This technique lets you force your king deep into enemy territory — useful for supporting a passed pawn's promotion or for invading and winning enemy pawns.",
        ],
      },
      {
        heading: "The Rule of the Square",
        body: [
          "Imagine a square extending from your passed pawn to the promotion square. If the enemy king is inside this square (or can step into it on its move), it can catch the pawn. If not, the pawn promotes.",
          "To construct the square: draw one side from the pawn's square to its promotion square. The other sides are the same length. The enemy king needs to be inside this square (counting the move) to catch the pawn.",
        ],
      },
      {
        heading: "Key Winning Technique: Outflanking",
        body: [
          "When you have the opposition and your king is forced to step aside, you 'outflank' the opponent — stepping diagonally forward to gain ground on the side.",
          "Pattern: kings in opposition, you move first, so you have the opposition. Opponent must step aside (e.g., to the left); you step diagonally to the right and forward. Now you've gained ground on the right flank.",
        ],
      },
      {
        heading: "Drawing Techniques: Stalemate & Defensive Opposition",
        body: [
          "If you're a pawn down in K+P vs K, you can often draw by taking the opposition. The defender's king stays in front of the pawn, blocks its advance, and forces the attacker's king to step aside.",
          "Stalemate is also a key defensive resource: if you can reduce your opponent's king to having no legal moves (while not in check), the game is a draw. Sometimes you can sacrifice your last piece to reach a stalemate position.",
        ],
      },
    ],
    keyTakeaways: [
      "Opposition = kings facing each other with one square between; the side NOT to move wins.",
      "Rule of the Square: imagine a square from the pawn to promotion — if the enemy king is inside, it catches the pawn.",
      "Outflanking lets you gain ground by stepping diagonally forward when the opponent gives way.",
      "Defensive opposition + stalemate tricks can save many lost-looking endgames.",
    ],
  },
  {
    id: "l-piece-values",
    title: "Piece Values & Trade Logic",
    category: "strategy",
    difficulty: "beginner",
    duration: "5 min read",
    intro:
      "The standard point values — pawn=1, knight=3, bishop=3, rook=5, queen=9 — are a starting point, not absolute. Real value depends on the position. The skill of trading is one of the most underrated in chess.",
    sections: [
      {
        heading: "Standard Values",
        body: [
          "Pawn = 1, Knight = 3, Bishop = 3 (slightly more, often 3.25), Rook = 5, Queen = 9. King is priceless (capture = game over).",
          "Two minor pieces (3+3=6) are typically slightly better than a rook + pawn (5+1=6) because of their coordination. Three minor pieces (9) are roughly equal to a queen.",
          "Two rooks (10) are typically better than a queen (9), because they can support each other and threaten the enemy king on the back ranks.",
        ],
      },
      {
        heading: "When Pieces Change Value",
        body: [
          "Bishops are worth more in open positions (fewer pawns blocking their diagonals). Knights are worth more in closed positions (their jumping ability matters more).",
          "The 'bishop pair' (both bishops) is worth about half a pawn extra — they cover both color complexes and rarely step on each other's toes.",
          "Rooks gain value as pawns come off — they love open files and the 7th rank. Queens lose value in cluttered positions where they're vulnerable to forks.",
        ],
      },
      {
        heading: "When to Trade",
        body: [
          "Trade when you're ahead in material — simplification helps the stronger side. Conversely, avoid trades when you're behind — keep pieces on to maximize tactical chances.",
          "Trade the opponent's best piece. If their knight is dominating on an outpost, exchange it off even at slight cost.",
          "Don't trade your best piece for the opponent's worst — a useful knight is worth more than a passive bishop.",
        ],
      },
      {
        heading: "Trading into an Endgame",
        body: [
          "Before trading into an endgame, evaluate: (1) am I ahead? If yes, trade. (2) Is my king more active? Active king endgames favor the side with the better king. (3) Are there passed pawns? Passed pawns must be pushed in endgames.",
          "If you're defending a worse position, trading pieces increases the relative value of the opponent's advantage. Trade pawns instead of pieces — keep the pieces for tactical chances.",
        ],
      },
    ],
    keyTakeaways: [
      "Standard values are a guide, not a rule — position matters more.",
      "Trade when ahead; avoid trades when behind. Trade the opponent's best piece.",
      "Bishops love open positions; knights love closed ones. The bishop pair is worth ~0.5 pawns.",
      "Before trading into an endgame, consider material, king activity, and passed pawns.",
    ],
  },
];

export const LESSON_CATEGORIES = [
  { id: "rules", label: "Rules & Basics", icon: "1" },
  { id: "openings", label: "Openings", icon: "2" },
  { id: "tactics", label: "Tactics", icon: "3" },
  { id: "endgames", label: "Endgames", icon: "4" },
  { id: "strategy", label: "Strategy", icon: "5" },
] as const;
