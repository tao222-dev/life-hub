import crypto from "crypto";

export const SESSION_COOKIE = "lifehub_auth";

// 登录 cookie 的期望值 = sha256(APP_SESSION_SECRET)
export function sessionToken(): string {
  return crypto
    .createHash("sha256")
    .update(process.env.APP_SESSION_SECRET || "dev")
    .digest("hex");
}

// 常量时间比较，避免密码被爆破时泄露长度信息
export function verifyPassword(input: string): boolean {
  const expected = process.env.SITE_PASSWORD || "";
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
