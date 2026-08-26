#!/bin/bash
# Start both the Next.js app and the chess-online WebSocket mini-service.
# Use this script on your server (e.g. in a systemd unit, PM2, or just `./start.sh`).
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "[start] Launching thechess..."

# 1. Start the WebSocket mini-service in the background.
echo "[start] Starting chess-online mini-service on port 3003..."
cd "$ROOT_DIR/mini-services/chess-online"
nohup bun run dev > "$ROOT_DIR/mini-services/chess-online.log" 2>&1 &
echo $! > "$ROOT_DIR/mini-services/chess-online.pid"
disown
sleep 2

# 2. Start Next.js (port 3000). For production use `bun run start` after `bun run build`.
cd "$ROOT_DIR"
if [ "$NODE_ENV" = "production" ]; then
  echo "[start] Running in PRODUCTION mode (bun run start)..."
  bun run start
else
  echo "[start] Running in DEV mode (bun run dev)..."
  bun run dev
fi
