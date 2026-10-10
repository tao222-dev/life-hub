import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const items = await prisma.routine.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const b = await req.json();
  const data = {
    date: b.date,
    wakeAt: b.wakeAt ? new Date(b.wakeAt) : null,
    sleepAt: b.sleepAt ? new Date(b.sleepAt) : null,
    quality: b.quality ?? 3,
    note: b.note || null,
  };
  const item = await prisma.routine.upsert({
    where: { date: data.date },
    update: data,
    create: data,
  });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) await prisma.routine.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
