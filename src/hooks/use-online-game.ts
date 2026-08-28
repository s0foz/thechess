"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Chess, type Square } from "chess.js";
import { ChessEngine, type EngineSnapshot } from "@/lib/chess/engine";

export interface OnlinePlayer {
  userId: string;
  username: string;
  rating: number;
}

export interface OnlineGameState {
  status: "idle" | "queueing" | "playing" | "ended";
  gameId: string | null;
  color: "w" | "b" | null;
  opponent: OnlinePlayer | null;
  snapshot: EngineSnapshot | null;
  result: "white" | "black" | "draw" | null;
  reason: string | null;
  queuePosition: number;
  totalQueued: number;
  opponentDisconnected: boolean;
  drawOfferedBy: "white" | "black" | null;
}

interface UseOnlineGameArgs {
  enabled: boolean;
  user: { id: string; username: string; rating: number } | undefined;
  onGameEnd?: (result: "white" | "black" | "draw", reason: string) => void;
  onCapture?: (pieceType: "p" | "n" | "b" | "r" | "q", awarded: number) => void;
}

export function useOnlineGame({ enabled, user, onGameEnd, onCapture }: UseOnlineGameArgs) {
  const socketRef = useRef<Socket | null>(null);
  const engineRef = useRef<ChessEngine>(new ChessEngine());
  const [state, setState] = useState<OnlineGameState>({
    status: "idle",
    gameId: null,
    color: null,
    opponent: null,
    snapshot: null,
    result: null,
    reason: null,
    queuePosition: 0,
    totalQueued: 0,
    opponentDisconnected: false,
    drawOfferedBy: null,
  });

  // Connect to the socket server (Render WebSocket service).
  // ⚠️ Replace this URL with your actual Render service URL.
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ??
    "https://thechess-ws.onrender.com";

  // Connect to the socket server.
  useEffect(() => {
    if (!enabled) return;
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on("queue:status", (data: { position: number; totalQueued: number }) => {
      setState((s) => ({ ...s, queuePosition: data.position, totalQueued: data.totalQueued }));
    });

    socket.on("queue:left", () => {
      setState((s) => ({ ...s, status: "idle", queuePosition: 0, totalQueued: 0 }));
    });

    socket.on("game:start", (data: {
      gameId: string;
      color: "w" | "b";
      opponent: OnlinePlayer;
      you: OnlinePlayer;
    }) => {
      engineRef.current = new ChessEngine();
      setState({
        status: "playing",
        gameId: data.gameId,
        color: data.color,
        opponent: data.opponent,
        snapshot: engineRef.current.snapshot(),
        result: null,
        reason: null,
        queuePosition: 0,
        totalQueued: 0,
        opponentDisconnected: false,
        drawOfferedBy: null,
      });
    });

    socket.on("game:move", (data: { from: string; to: string; promotion?: string; san: string }) => {
      engineRef.current.move(data.from as Square, data.to as Square, data.promotion as any);
      setState((s) => ({ ...s, snapshot: engineRef.current.snapshot() }));
    });

    socket.on("game:move:replay", (data: { san: string }) => {
      // For reconnection — replay SAN moves
      try {
        const chess = new Chess(engineRef.current.fen);
        const mv = chess.move(data.san);
        if (mv) {
          engineRef.current.move(mv.from as Square, mv.to as Square, mv.promotion as any);
          setState((s) => ({ ...s, snapshot: engineRef.current.snapshot() }));
        }
      } catch {
        // ignore
      }
    });

    socket.on("game:end", (data: { result: "white" | "black" | "draw"; reason: string; moves: string[] }) => {
      setState((s) => ({
        ...s,
        status: "ended",
        result: data.result,
        reason: data.reason,
        snapshot: engineRef.current.snapshot(),
      }));
      onGameEnd?.(data.result, data.reason);
    });

    socket.on("game:capture", (data: { pieceType: string; awarded: number }) => {
      // Server tells us we captured a piece. Award currency via the API.
      fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pieceType: data.pieceType }),
      }).catch(() => {});
      onCapture?.(data.pieceType as any, data.awarded);
    });

    socket.on("game:opponent_disconnected", (data: { graceSeconds: number }) => {
      setState((s) => ({ ...s, opponentDisconnected: true }));
    });

    socket.on("game:opponent_reconnected", () => {
      setState((s) => ({ ...s, opponentDisconnected: false }));
    });

    socket.on("game:draw_offer", (data: { from: "white" | "black" }) => {
      setState((s) => ({ ...s, drawOfferedBy: data.from }));
    });

    socket.on("game:draw_declined", () => {
      setState((s) => ({ ...s, drawOfferedBy: null }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const joinQueue = () => {
    if (!user || !socketRef.current) return;
    socketRef.current.emit("queue:join", {
      userId: user.id,
      username: user.username,
      rating: user.rating,
    });
    setState((s) => ({ ...s, status: "queueing" }));
  };

  const leaveQueue = () => {
    socketRef.current?.emit("queue:leave");
  };

  const makeMove = (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => {
    if (state.status !== "playing" || !state.color) return;
    if (engineRef.current.turn !== state.color) return;
    // Apply locally first.
    const mv = engineRef.current.move(from, to, promotion);
    if (!mv) return;
    setState((s) => ({ ...s, snapshot: engineRef.current.snapshot() }));
    // Send to server.
    socketRef.current?.emit("game:move", { from, to, promotion });
  };

  const resign = () => {
    socketRef.current?.emit("game:resign");
  };

  const offerDraw = () => {
    socketRef.current?.emit("game:draw_offer");
  };

  const respondDraw = (accept: boolean) => {
    socketRef.current?.emit("game:draw_response", { accept });
    setState((s) => ({ ...s, drawOfferedBy: null }));
  };

  const reset = () => {
    setState({
      status: "idle",
      gameId: null,
      color: null,
      opponent: null,
      snapshot: null,
      result: null,
      reason: null,
      queuePosition: 0,
      totalQueued: 0,
      opponentDisconnected: false,
      drawOfferedBy: null,
    });
  };

  return {
    state,
    joinQueue,
    leaveQueue,
    makeMove,
    resign,
    offerDraw,
    respondDraw,
    reset,
  };
}
