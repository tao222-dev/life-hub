import { NextResponse } from "next/server";
import { verifyPassword, sessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!verifyPassword(password || "")) {
    return NextResponse.json({ error: "wrong" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
