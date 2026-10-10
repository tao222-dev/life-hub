import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (date) {
    const item = await prisma.journal.findUnique({ where: { date } });
    return NextResponse.json(item);
  }
  const items = await prisma.journal.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const b = await req.json();
  const data = { date: b.date, content: b.content, mood: b.mood || null };
  const item = await prisma.journal.upsert({
    where: { date: data.date },
    update: data,
    create: data,
  });
  return NextResponse.json(item);
}
