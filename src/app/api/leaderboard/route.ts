import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const users = await db.user.findMany({
    orderBy: { rating: "desc" },
    take: 50,
    select: {
      id: true,
      username: true,
      rating: true,
      level: true,
      xp: true,
      wins: true,
      losses: true,
      draws: true,
      puzzlesSolved: true,
    },
  });
  const ranked = users.map((u, i) => ({ ...u, rank: i + 1 }));
  return NextResponse.json({ leaderboard: ranked });
}
