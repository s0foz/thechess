import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PIECE_SKINS, BOARD_SKINS, TITLES } from "@/lib/thechess/shop";

export const runtime = "nodejs";

// GET /api/me — returns the current user's full profile (for the client to read pieces, owned skins, active skin, title)
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
      pieces: true,
      ownedSkins: true,
      ownedTitles: true,
      activePieceSkin: true,
      activeBoardSkin: true,
      activeTitle: true,
      createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ user: null });

  // Parse JSON arrays
  const profile = {
    ...user,
    ownedSkins: JSON.parse(user.ownedSkins) as string[],
    ownedTitles: JSON.parse(user.ownedTitles) as string[],
  };
  return NextResponse.json({ user: profile });
}
