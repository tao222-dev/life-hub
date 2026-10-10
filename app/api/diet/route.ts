import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const where = date ? { date } : {};
  const items = await prisma.meal.findMany({
    where,
    orderBy: { id: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const b = await req.json();
  const item = await prisma.meal.create({
    data: {
      date: b.date,
      type: b.type,
      content: b.content,
      calories: b.calories ?? null,
      note: b.note || null,
      imageUrl: b.imageUrl || null,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) await prisma.meal.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
