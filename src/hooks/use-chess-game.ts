"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChessEngine,
  type EngineSnapshot,
  type MoveRecord,
  type PieceColor,
} from "@/lib/chess/engine";
import { findBestMove, DIFFICULTY_PRESETS, type AIConfig, type Difficulty } from "@/lib/chess/ai";
import type { Square } from "chess.js";

export type GameMode = "ai" | "human";

export interface GameSettings {
  mode: GameMode;
  playerColor: PieceColor; // human's color (only relevant in AI mode)
  difficulty: Difficulty;
}

export interface PendingPromotion {
  from: Square;
  to: Square;
  color: PieceColor;
}

export function useChessGame(initialSettings?: GameSettings) {
  const engineRef = useRef<ChessEngine>(new ChessEngine());
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => engineRef.current.snapshot());
  const [settings, setSettings] = useState<GameSettings>(
    initialSettings ?? { mode: "ai", playerColor: "w", difficulty: "medium" },
  );
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMoveSan, setLastMoveSan] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSnapshot(engineRef.current.snapshot());
  }, []);

  const newGame = useCallback(
    (newSettings?: GameSettings) => {
      engineRef.current = new ChessEngine();
      if (newSettings) setSettings(newSettings);
      setSnapshot(engineRef.current.snapshot());
      setLastMoveSan(null);
      setPendingPromotion(null);
      setIsAiThinking(false);
    },
    [],
  );

  const applyMove = useCallback(
    (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n"): MoveRecord | null => {
      const mv = engineRef.current.move(from, to, promotion);
      if (mv) {
        setSnapshot(engineRef.current.snapshot());
        setLastMoveSan(mv.san);
      }
      return mv;
    },
    [],
  );

  const undo = useCallback(() => {
    // In AI mode, undo two plies so it's the human's move again.
    if (settings.mode === "ai") {
      engineRef.current.undo();
      engineRef.current.undo();
    } else {
      engineRef.current.undo();
    }
    setSnapshot(engineRef.current.snapshot());
    setLastMoveSan(
      engineRef.current.snapshot().moves.at(-1)?.san ?? null,
    );
    setPendingPromotion(null);
  }, [settings.mode]);

  const requestMove = useCallback(
    (from: Square, to: Square): boolean => {
      const engine = engineRef.current;
      const legal = engine.legalMovesFrom(from);
      const matching = legal.filter((m) => m.to === to);
      if (matching.length === 0) return false;

      // If promotion is possible, defer to promotion dialog.
      const promotions = matching.filter((m) => m.promotion);
      if (promotions.length > 0) {
        setPendingPromotion({
          from,
          to,
          color: engine.turn,
        });
        return true;
      }

      applyMove(from, to);
      return true;
    },
    [applyMove],
  );

  const completePromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      applyMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    },
    [pendingPromotion, applyMove],
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
  }, []);

  // AI move loop. When the engine is at a position where it's the AI's turn
  // (in AI mode), compute and apply the AI's best move.
  useEffect(() => {
    if (settings.mode !== "ai") return;
    if (snapshot.status === "checkmate" || snapshot.status === "stalemate" || snapshot.status === "draw" || snapshot.status === "threefold" || snapshot.status === "insufficient" || snapshot.status === "fifty-move") {
      return;
    }
    if (snapshot.turn === settings.playerColor) return;
    if (pendingPromotion) return;

    const config: AIConfig = DIFFICULTY_PRESETS[settings.difficulty];
    setIsAiThinking(true);
    // Use a microtask + small delay so UI updates before the (synchronous)
    // minimax search blocks the main thread.
    const handle = setTimeout(() => {
      try {
        const engine = engineRef.current;
        const best = findBestMove(engine, config);
        if (best) {
          applyMove(best.from, best.to, best.promotion);
        }
      } finally {
        setIsAiThinking(false);
      }
    }, 300);

    return () => {
      clearTimeout(handle);
      setIsAiThinking(false);
    };
  }, [snapshot.turn, snapshot.status, settings, pendingPromotion, applyMove]);

  const isHumanTurn =
    settings.mode === "human" || snapshot.turn === settings.playerColor;

  return {
    snapshot,
    settings,
    pendingPromotion,
    isAiThinking,
    lastMoveSan,
    isHumanTurn,
    requestMove,
    completePromotion,
    cancelPromotion,
    newGame,
    undo,
    updateSettings: setSettings,
    refresh,
    engine: engineRef,
  };
}
