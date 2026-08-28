import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface EquipBody {
  type: "piece-skin" | "board-skin" | "title";
  id: string | null; // null = unequip (for titles)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  const body = (await req.json()) as EquipBody;

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const ownedSkins = JSON.parse(user.ownedSkins) as string[];
  const ownedTitles = JSON.parse(user.ownedTitles) as string[];

  let updateData: any;
  if (body.type === "piece-skin") {
    if (body.id && !ownedSkins.includes(body.id)) {
      return NextResponse.json({ error: "Not owned" }, { status: 403 });
    }
    updateData = { activePieceSkin: body.id ?? "default" };
  } else if (body.type === "board-skin") {
    if (body.id && !ownedSkins.includes(body.id)) {
      return NextResponse.json({ error: "Not owned" }, { status: 403 });
    }
    updateData = { activeBoardSkin: body.id ?? "default" };
  } else if (body.type === "title") {
    if (body.id && !ownedTitles.includes(body.id)) {
      return NextResponse.json({ error: "Not owned" }, { status: 403 });
    }
    updateData = { activeTitle: body.id }; // null = unequip
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

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
