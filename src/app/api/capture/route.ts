import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// POST /api/capture — awards pieces to the user when they capture a piece.
// Called from the frontend whenever a capture happens (both AI and online games).
interface CaptureBody {
  pieceType: "p" | "n" | "b" | "r" | "q" | "k";
  count?: number; // default 1
}

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const body = (await req.json()) as CaptureBody;

  const value = PIECE_VALUES[body.pieceType];
  if (value === undefined) {
    return NextResponse.json({ error: "Invalid piece type" }, { status: 400 });
  }
  const count = body.count ?? 1;
  const award = value * count;

  const updated = await db.user.update({
    where: { id: userId },
    data: { pieces: { increment: award } },
    select: { id: true, pieces: true },
  });

  return NextResponse.json({ ok: true, pieces: updated.pieces, awarded: award });
}
