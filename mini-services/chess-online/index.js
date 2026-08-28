const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

// Piece values for awarding currency on capture.
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// Award pieces currency to a user when they capture a piece.
// Calls the Next.js app's /api/capture endpoint (authenticated via session cookie).
// Note: the chess-online service doesn't have the user's session cookie, so we
// call the service-to-service /api/game-end endpoint pattern instead — but for
// captures, we use a simpler approach: emit a `game:capture` event to the
// capturing player's client, which then calls /api/capture from the browser
// (where the session cookie IS available).
function awardPieces(userId, capturedPiece) {
  // No server-side call needed — the client receives `game:capture` and
  // POSTs to /api/capture itself. This function is a placeholder for
  // future server-side awarding (e.g. if we add a service-to-service auth).
  // The actual awarding happens client-side via the capture event.
  console.log(`[capture] user ${userId} captured a ${capturedPiece} (+${PIECE_VALUES[capturedPiece] || 0} pieces potential)`);
}

// In-memory state for the matchmaking queue + active games.
const queue = [];
const games = new Map();
// Map socketId -> gameId (for routing moves)
const socketGame = new Map();

function generateGameId() {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function tryMatchmake() {
  if (queue.length < 2) return;
  // Sort queue by rating for closest match
  queue.sort((a, b) => a.rating - b.rating);
  // Pair adjacent players if their rating diff is reasonable.
  for (let i = 0; i < queue.length - 1; i++) {
    const a = queue[i];
    const b = queue[i + 1];
    const diff = Math.abs(a.rating - b.rating);
    // Allow up to 300 rating diff after 30s of waiting, else 150.
    const maxDiff = Date.now() - Math.min(a.joinedAt, b.joinedAt) > 30000 ? 300 : 150;
    if (diff <= maxDiff) {
      queue.splice(i, 2);
      startGame(a, b);
      tryMatchmake();
      return;
    }
  }
}

function startGame(p1, p2) {
  const gameId = generateGameId();
  // Randomize colors.
  const white = Math.random() < 0.5 ? p1 : p2;
  const black = white === p1 ? p2 : p1;
  const game = {
    id: gameId,
    white: { userId: white.userId, username: white.username, rating: white.rating, socketId: white.socketId },
    black: { userId: black.userId, username: black.username, rating: black.rating, socketId: black.socketId },
    chess: new Chess(),
    moves: [],
    createdAt: Date.now(),
    disconnectTimers: {},
  };
  games.set(gameId, game);
  socketGame.set(white.socketId, gameId);
  socketGame.set(black.socketId, gameId);

  io.to(white.socketId).emit("game:start", {
    gameId,
    color: "w",
    opponent: { username: black.username, rating: black.rating, userId: black.userId },
    you: { username: white.username, rating: white.rating, userId: white.userId },
  });
  io.to(black.socketId).emit("game:start", {
    gameId,
    color: "b",
    opponent: { username: white.username, rating: white.rating, userId: white.userId },
    you: { username: black.username, rating: black.rating, userId: black.userId },
  });
  console.log(`[game ${gameId}] started: ${white.username} (${white.rating}) vs ${black.username} (${black.rating})`);
}

function endGame(game, result, reason) {
  if (game.disconnectTimers.white) clearTimeout(game.disconnectTimers.white);
  if (game.disconnectTimers.black) clearTimeout(game.disconnectTimers.black);
  io.to(game.white.socketId).emit("game:end", { result, reason, moves: game.moves });
  io.to(game.black.socketId).emit("game:end", { result, reason, moves: game.moves });

  // Notify the Next.js app to persist the result + update ratings.
  const serviceSecret = process.env.SERVICE_SECRET || "dev-service-secret";
  const endpoint = process.env.GAME_END_ENDPOINT || "http://localhost:3000/api/game-end";
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceSecret}`,
    },
    body: JSON.stringify({
      gameId: game.id,
      whiteId: game.white.userId,
      blackId: game.black.userId,
      result,
      reason,
      moves: game.moves,
    }),
  }).catch((err) => console.error("Failed to record game:", err));

  games.delete(game.id);
  socketGame.delete(game.white.socketId);
  socketGame.delete(game.black.socketId);
}

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on("queue:join", (data) => {
    // Remove if already queued.
    const existing = queue.findIndex((p) => p.socketId === socket.id);
    if (existing !== -1) queue.splice(existing, 1);
    queue.push({
      socketId: socket.id,
      userId: data.userId,
      username: data.username,
      rating: data.rating,
      joinedAt: Date.now(),
    });
    console.log(`[queue] ${data.username} (${data.rating}) joined — queue size: ${queue.length}`);
    socket.emit("queue:status", { position: queue.length, totalQueued: queue.length });
    tryMatchmake();
  });

  socket.on("queue:leave", () => {
    const idx = queue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) {
      queue.splice(idx, 1);
      console.log(`[queue] ${socket.id} left — queue size: ${queue.length}`);
    }
    socket.emit("queue:left", {});
  });

  socket.on("game:move", (data) => {
    const gameId = socketGame.get(socket.id);
    if (!gameId) return;
    const game = games.get(gameId);
    if (!game) return;
    // Verify it's this socket's turn.
    const turn = game.chess.turn();
    const isWhite = game.white.socketId === socket.id;
    if ((turn === "w") !== isWhite) return;
    try {
      const mv = game.chess.move({ from: data.from, to: data.to, promotion: data.promotion || "q" });
      if (!mv) return;
      game.moves.push(mv.san);
      const opponentSocketId = isWhite ? game.black.socketId : game.white.socketId;
      io.to(opponentSocketId).emit("game:move", {
        from: mv.from,
        to: mv.to,
        promotion: mv.promotion,
        san: mv.san,
      });

      // Award pieces currency to the mover if they captured a piece.
      if (mv.captured) {
        const capturingUserId = isWhite ? game.white.userId : game.black.userId;
        awardPieces(capturingUserId, mv.captured);
        // Also tell the mover's client how many pieces they just earned (for a floating +N toast)
        io.to(socket.id).emit("game:capture", {
          pieceType: mv.captured,
          awarded: PIECE_VALUES[mv.captured] || 0,
        });
      }

      // Check for game end.
      if (game.chess.isCheckmate()) {
        const winner = turn; // side that just moved wins
        endGame(game, winner === "w" ? "white" : "black", "checkmate");
      } else if (game.chess.isStalemate()) {
        endGame(game, "draw", "stalemate");
      } else if (game.chess.isInsufficientMaterial()) {
        endGame(game, "draw", "insufficient");
      } else if (game.chess.isThreefoldRepetition()) {
        endGame(game, "draw", "threefold");
      } else if (game.chess.isDraw()) {
        endGame(game, "draw", "fifty-move");
      }
    } catch {
      // illegal move — ignore
    }
  });

  socket.on("game:resign", () => {
    const gameId = socketGame.get(socket.id);
    if (!gameId) return;
    const game = games.get(gameId);
    if (!game) return;
    const isWhite = game.white.socketId === socket.id;
    endGame(game, isWhite ? "black" : "white", "resign");
  });

  socket.on("game:draw_offer", () => {
    const gameId = socketGame.get(socket.id);
    if (!gameId) return;
    const game = games.get(gameId);
    if (!game) return;
    const isWhite = game.white.socketId === socket.id;
    const opponentSocketId = isWhite ? game.black.socketId : game.white.socketId;
    io.to(opponentSocketId).emit("game:draw_offer", { from: isWhite ? "white" : "black" });
  });

  socket.on("game:draw_response", (data) => {
    const gameId = socketGame.get(socket.id);
    if (!gameId) return;
    const game = games.get(gameId);
    if (!game) return;
    if (data.accept) {
      endGame(game, "draw", "draw_agreement");
    } else {
      const isWhite = game.white.socketId === socket.id;
      const opponentSocketId = isWhite ? game.black.socketId : game.white.socketId;
      io.to(opponentSocketId).emit("game:draw_declined", {});
    }
  });

  socket.on("disconnect", () => {
    // Remove from queue.
    const qIdx = queue.findIndex((p) => p.socketId === socket.id);
    if (qIdx !== -1) queue.splice(qIdx, 1);

    // If in a game, start a 30s disconnect timer; if not back, abandon -> opponent wins.
    const gameId = socketGame.get(socket.id);
    if (gameId) {
      const game = games.get(gameId);
      if (game) {
        const isWhite = game.white.socketId === socket.id;
        const timerKey = isWhite ? "white" : "black";
        if (game.disconnectTimers[timerKey]) clearTimeout(game.disconnectTimers[timerKey]);
        // Notify opponent.
        const opponentSocketId = isWhite ? game.black.socketId : game.white.socketId;
        io.to(opponentSocketId).emit("game:opponent_disconnected", { graceSeconds: 30 });

        game.disconnectTimers[timerKey] = setTimeout(() => {
          const g = games.get(gameId);
          if (!g) return;
          // Re-check; player might have reconnected.
          if (isWhite ? g.white.socketId === socket.id : g.black.socketId === socket.id) {
            endGame(g, isWhite ? "black" : "white", "abandon");
          }
        }, 30000);
      }
    }
    console.log(`[socket] disconnected: ${socket.id}`);
  });

  // Allow a player to "rejoin" a game after a transient disconnect.
  socket.on("game:reconnect", (data) => {
    const game = games.get(data.gameId);
    if (!game) {
      socket.emit("game:reconnect_failed", { reason: "Game not found." });
      return;
    }
    const isWhite = game.white.userId === data.userId;
    const isBlack = game.black.userId === data.userId;
    if (!isWhite && !isBlack) {
      socket.emit("game:reconnect_failed", { reason: "Not a player in this game." });
      return;
    }
    // Update socketId, cancel disconnect timer.
    const side = isWhite ? "white" : "black";
    if (game.disconnectTimers[side]) {
      clearTimeout(game.disconnectTimers[side]);
      delete game.disconnectTimers[side];
    }
    if (isWhite) {
      socketGame.delete(game.white.socketId);
      game.white.socketId = socket.id;
    } else {
      socketGame.delete(game.black.socketId);
      game.black.socketId = socket.id;
    }
    socketGame.set(socket.id, game.id);
    // Send current state.
    const color = isWhite ? "w" : "b";
    socket.emit("game:start", {
      gameId: game.id,
      color,
      opponent: isWhite
        ? { username: game.black.username, rating: game.black.rating, userId: game.black.userId }
        : { username: game.white.username, rating: game.white.rating, userId: game.white.userId },
      you: isWhite
        ? { username: game.white.username, rating: game.white.rating, userId: game.white.userId }
        : { username: game.black.username, rating: game.black.rating, userId: game.black.userId },
    });
    // Send moves so far.
    for (const san of game.moves) {
      socket.emit("game:move:replay", { san });
    }
    // Notify opponent that player reconnected.
    const opponentSocketId = isWhite ? game.black.socketId : game.white.socketId;
    io.to(opponentSocketId).emit("game:opponent_reconnected", {});
  });
});

// Use Render's PORT env var if set, otherwise default to 3003.
const PORT = process.env.PORT || 3003;
httpServer.listen(PORT, () => {
  console.log(`[chess-online] WebSocket server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("[chess-online] SIGTERM received, shutting down...");
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("[chess-online] SIGINT received, shutting down...");
  httpServer.close(() => process.exit(0));
});
