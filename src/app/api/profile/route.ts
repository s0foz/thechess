import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const userId = (session.user as any).id as string;
  const user = await db.user.findUnique({
    where: { id: userId },
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
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ user: null });

  const recentGames = await db.game.findMany({
    where: {
      OR: [{ whiteId: userId }, { blackId: userId }],
      endedAt: { not: null },
    },
    orderBy: { endedAt: "desc" },
    take: 10,
    include: {
      white: { select: { id: true, username: true, rating: true } },
      black: { select: { id: true, username: true, rating: true } },
    },
  });

  return NextResponse.json({ user, recentGames });
}
