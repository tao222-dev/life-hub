import { NextResponse } from "next/server";

// Vercel 是无状态文件系统，不能写本地磁盘。
// 改为把图片读成 base64 data URL 返回，由 /api/diet 存进 Postgres，
// 这样饮食照片也能跨设备同步，无需额外的对象存储服务。
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  const base64 = buf.toString("base64");
  const dataUrl = `data:${mime};base64,${base64}`;

  return NextResponse.json({ url: dataUrl });
}
