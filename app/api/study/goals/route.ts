import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const goals = await prisma.studyGoal.findMany({
    include: { tasks: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const b = await req.json();
  const goal = await prisma.studyGoal.create({
    data: { title: b.title, category: b.category || null },
  });
  return NextResponse.json(goal);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) await prisma.studyGoal.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
