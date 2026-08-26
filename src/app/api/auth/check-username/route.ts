import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// Lightweight endpoint used by the sign-in modal to distinguish
// "user doesn't exist" from "wrong password" for better UX.
// Returns only whether the username exists — no PII.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = (url.searchParams.get("username") ?? "").trim().toLowerCase();
  if (!username) return NextResponse.json({ exists: false });
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return NextResponse.json({ exists: !!user });
}
