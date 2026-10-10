import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "lifehub_auth";

// 边缘运行时下用 Web Crypto 计算 sha256（与登录时 node crypto 结果一致）
async function sha256(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(req: NextRequest) {
  const secret = process.env.APP_SESSION_SECRET || "dev";
  const valid = await sha256(secret);
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  // 登录页与登录接口放行
  if (pathname === "/login" || pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  if (cookie === valid) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
