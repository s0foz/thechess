import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { PIECE_SKINS, BOARD_SKINS, TITLES } from "@/lib/thechess/shop";

export const runtime = "nodejs";

interface BuyBody {
  type: "piece-skin" | "board-skin" | "title";
  id: string;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const body = (await req.json()) as BuyBody;

  // Look up the item + its cost.
  let cost: number;
  let itemId: string;
  let category: "skins" | "titles";

  if (body.type === "piece-skin") {
    const item = PIECE_SKINS.find((s) => s.id === body.id);
    if (!item) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    cost = item.cost;
    itemId = item.id;
    category = "skins";
  } else if (body.type === "board-skin") {
    const item = BOARD_SKINS.find((s) => s.id === body.id);
    if (!item) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    cost = item.cost;
    itemId = item.id;
    category = "skins";
  } else if (body.type === "title") {
    const item = TITLES.find((t) => t.id === body.id);
    if (!item) return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    cost = item.cost;
    itemId = item.id;
    category = "titles";
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Fetch the user.
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Already owned?
  const owned = category === "skins" ? JSON.parse(user.ownedSkins) : JSON.parse(user.ownedTitles);
  if (owned.includes(itemId)) {
    return NextResponse.json({ error: "Already owned" }, { status: 400 });
  }

  // Check rating requirement (for titles).
  if (body.type === "title") {
    const title = TITLES.find((t) => t.id === body.id)!;
    if (title.minRating && user.rating < title.minRating) {
      return NextResponse.json(
        { error: `Requires ${title.minRating} rating` },
        { status: 403 },
      );
    }
  }

  // Check pieces balance.
  if (user.pieces < cost) {
    return NextResponse.json({ error: "Not enough pieces" }, { status: 402 });
  }

  // Deduct + add to owned list.
  const newOwned = [...owned, itemId];
  const updateData =
    category === "skins"
      ? { pieces: user.pieces - cost, ownedSkins: JSON.stringify(newOwned) }
      : { pieces: user.pieces - cost, ownedTitles: JSON.stringify(newOwned) };

  const updated = await db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      pieces: true,
      ownedSkins: true,
      ownedTitles: true,
      activePieceSkin: true,
      activeBoardSkin: true,
      activeTitle: true,
    },
  });

  return NextResponse.json({
    ok: true,
    user: {
      ...updated,
      ownedSkins: JSON.parse(updated.ownedSkins),
      ownedTitles: JSON.parse(updated.ownedTitles),
    },
  });
}
