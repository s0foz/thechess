import { Chess, type Move, type Square } from "chess.js";

export type PieceColor = "w" | "b";
export type GameStatus =
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "threefold"
  | "insufficient"
  | "fifty-move";

export interface PieceInfo {
  type: "p" | "n" | "b" | "r" | "q" | "k";
  color: PieceColor;
}

export type BoardSquare = PieceInfo | null;

export interface MoveRecord {
  from: Square;
  to: Square;
  san: string;
  color: PieceColor;
  piece: "p" | "n" | "b" | "r" | "q" | "k";
  captured?: "p" | "n" | "b" | "r" | "q" | "k";
  promotion?: "q" | "r" | "b" | "n";
  flags: string;
}

export interface EngineSnapshot {
  board: BoardSquare[][];
  turn: PieceColor;
  status: GameStatus;
  moves: MoveRecord[];
  capturedByWhite: Array<"p" | "n" | "b" | "r" | "q" | "k">;
  capturedByBlack: Array<"p" | "n" | "b" | "r" | "q" | "k">;
  fen: string;
  lastMove: { from: Square; to: Square } | null;
  inCheck: boolean;
  checkSquare: Square | null;
  kingSquare: { w: Square | null; b: Square | null };
}

const PIECE_VALUES: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export class ChessEngine {
  private game: Chess;

  constructor(fen?: string) {
    this.game = fen ? new Chess(fen) : new Chess();
  }

  static fromFen(fen: string): ChessEngine {
    return new ChessEngine(fen);
  }

  clone(): ChessEngine {
    return new ChessEngine(this.game.fen());
  }

  get fen(): string {
    return this.game.fen();
  }

  get turn(): PieceColor {
    return this.game.turn();
  }

  /**
   * Returns the board as a 2D array [row][col] from rank 8 (top) to rank 1 (bottom).
   * Columns are files a-h (left to right).
   */
  getBoard(): BoardSquare[][] {
    return this.game.board().map((row) =>
      row.map((sq) => {
        if (sq === null) return null;
        return { type: sq.type, color: sq.color as PieceColor };
      }),
    );
  }

  legalMovesFrom(square: Square): Move[] {
    return this.game.moves({ square, verbose: true }) as Move[];
  }

  legalMoves(): Move[] {
    return this.game.moves({ verbose: true }) as Move[];
  }

  move(from: Square, to: Square, promotion?: "q" | "r" | "b" | "n"): MoveRecord | null {
    try {
      const mv = this.game.move({
        from,
        to,
        promotion: promotion ?? "q",
      });
      if (!mv) return null;
      return {
        from: mv.from,
        to: mv.to,
        san: mv.san,
        color: mv.color as PieceColor,
        piece: mv.piece as MoveRecord["piece"],
        captured: mv.captured as MoveRecord["captured"],
        promotion: mv.promotion as MoveRecord["promotion"],
        flags: mv.flags,
      };
    } catch {
      return null;
    }
  }

  undo(): MoveRecord | null {
    const mv = this.game.undo();
    if (!mv) return null;
    return {
      from: mv.from,
      to: mv.to,
      san: mv.san,
      color: mv.color as PieceColor,
      piece: mv.piece as MoveRecord["piece"],
      captured: mv.captured as MoveRecord["captured"],
      promotion: mv.promotion as MoveRecord["promotion"],
      flags: mv.flags,
    };
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  isCheck(): boolean {
    return this.game.inCheck();
  }

  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  isDraw(): boolean {
    return this.game.isDraw();
  }

  isThreefoldRepetition(): boolean {
    return this.game.isThreefoldRepetition();
  }

  isInsufficientMaterial(): boolean {
    return this.game.isInsufficientMaterial();
  }

  isDrawByFiftyMoves(): boolean {
    const fen = this.game.fen();
    const parts = fen.split(" ");
    const halfmoveClock = parseInt(parts[4] ?? "0", 10);
    return halfmoveClock >= 100;
  }

  status(): GameStatus {
    if (this.isCheckmate()) return "checkmate";
    if (this.isStalemate()) return "stalemate";
    if (this.isThreefoldRepetition()) return "threefold";
    if (this.isInsufficientMaterial()) return "insufficient";
    if (this.isDrawByFiftyMoves()) return "fifty-move";
    if (this.isDraw()) return "draw";
    if (this.isCheck()) return "check";
    return "playing";
  }

  findKing(color: PieceColor): Square | null {
    const board = this.game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq && sq.type === "k" && sq.color === color) {
          const file = String.fromCharCode("a".charCodeAt(0) + c);
          const rank = 8 - r;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }

  snapshot(): EngineSnapshot {
    const board = this.getBoard();
    const moves = (this.game.history({ verbose: true }) as Move[]).map<MoveRecord>((mv) => ({
      from: mv.from,
      to: mv.to,
      san: mv.san,
      color: mv.color as PieceColor,
      piece: mv.piece as MoveRecord["piece"],
      captured: mv.captured as MoveRecord["captured"],
      promotion: mv.promotion as MoveRecord["promotion"],
      flags: mv.flags,
    }));

    const capturedByWhite: MoveRecord["captured"][] = [];
    const capturedByBlack: MoveRecord["captured"][] = [];
    for (const mv of moves) {
      if (!mv.captured) continue;
      if (mv.color === "w") capturedByWhite.push(mv.captured);
      else capturedByBlack.push(mv.captured);
    }

    const lastMove =
      moves.length > 0
        ? { from: moves[moves.length - 1].from, to: moves[moves.length - 1].to }
        : null;

    const inCheck = this.isCheck();
    const checkSquare = inCheck ? this.findKing(this.turn) : null;

    return {
      board,
      turn: this.turn,
      status: this.status(),
      moves,
      capturedByWhite,
      capturedByBlack,
      fen: this.fen,
      lastMove,
      inCheck,
      checkSquare,
      kingSquare: { w: this.findKing("w"), b: this.findKing("b") },
    };
  }

  materialBalance(): number {
    const snap = this.snapshot();
    let white = 0;
    let black = 0;
    for (const row of snap.board) {
      for (const sq of row) {
        if (!sq) continue;
        const v = PIECE_VALUES[sq.type];
        if (sq.color === "w") white += v;
        else black += v;
      }
    }
    return white - black;
  }
}

export { PIECE_VALUES };
