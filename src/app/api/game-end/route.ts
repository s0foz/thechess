import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Called by the chess-online mini-service after a game ends.
// Auth uses a shared secret so we don't expose this endpoint to the public.
const SERVICE_SECRET = process.env.SERVICE_SECRET ?? "dev-service-secret";

interface EndGameBody {
  gameId: string;
  whiteId: string;
  blackId: string;
  result: "white" | "black" | "draw";
  reason: string;
  moves: string[]; // SAN moves
}

// Standard Elo rating update. K=32 for sub-2000, K=24 for 2000-2400, K=16 above.
function kFactor(rating: number) {
  if (rating < 2000) return 32;
  if (rating < 2400) return 24;
  return 16;
}

function expectedScore(a: number, b: number) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

function newXp(level: number) {
  // 100 XP to reach level 2, then +50 per level (capped growth).
  return 0; // placeholder — we add XP per game
}

function levelFromXp(xp: number) {
  // Each level requires level*100 XP.
  let level = 1;
  let need = 100;
  let remaining = xp;
  while (remaining >= need) {
    remaining -= need;
    level++;
    need = level * 100;
  }
  return level;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${SERVICE_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as EndGameBody;
    const { gameId, whiteId, blackId, result, reason, moves } = body;

    const [white, black] = await Promise.all([
      db.user.findUnique({ where: { id: whiteId } }),
      db.user.findUnique({ where: { id: blackId } }),
    ]);
    if (!white || !black) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Elo update.
    const eW = expectedScore(white.rating, black.rating);
    const eB = 1 - eW;
    const sW = result === "white" ? 1 : result === "draw" ? 0.5 : 0;
    const sB = 1 - sW;
    const k = kFactor(white.rating);
    const newWhiteRating = Math.round(white.rating + k * (sW - eW));
    const newBlackRating = Math.round(black.rating + k * (sB - eB));

    // XP: winner gets 30, loser gets 10, draw gives both 20.
    const whiteXp = result === "white" ? 30 : result === "draw" ? 20 : 10;
    const blackXp = result === "black" ? 30 : result === "draw" ? 20 : 10;
    const whiteNewXp = white.xp + whiteXp;
    const blackNewXp = black.xp + blackXp;
    const whiteNewLevel = levelFromXp(whiteNewXp);
    const blackNewLevel = levelFromXp(blackNewXp);

    // Update both users.
    await db.user.update({
      where: { id: whiteId },
      data: {
        rating: newWhiteRating,
        xp: whiteNewXp,
        level: whiteNewLevel,
        wins: result === "white" ? white.wins + 1 : white.wins,
        losses: result === "black" ? white.losses + 1 : white.losses,
        draws: result === "draw" ? white.draws + 1 : white.draws,
      },
    });
    await db.user.update({
      where: { id: blackId },
      data: {
        rating: newBlackRating,
        xp: blackNewXp,
        level: blackNewLevel,
        wins: result === "black" ? black.wins + 1 : black.wins,
        losses: result === "white" ? black.losses + 1 : black.losses,
        draws: result === "draw" ? black.draws + 1 : black.draws,
      },
    });

    // Save game record.
    await db.game.upsert({
      where: { id: gameId },
      update: {
        result,
        reason,
        moves: JSON.stringify(moves),
        endedAt: new Date(),
      },
      create: {
        id: gameId,
        whiteId,
        blackId,
        result,
        reason,
        moves: JSON.stringify(moves),
        endedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      white: { rating: newWhiteRating, level: whiteNewLevel, xp: whiteNewXp },
      black: { rating: newBlackRating, level: blackNewLevel, xp: blackNewXp },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
