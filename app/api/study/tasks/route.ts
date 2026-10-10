import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json();
  const task = await prisma.studyTask.create({
    data: { goalId: Number(b.goalId), title: b.title },
  });
  return NextResponse.json(task);
}

export async function PATCH(req: Request) {
  const b = await req.json();
  const data: any = {};
  if (typeof b.done === "boolean") data.done = b.done;
  if (typeof b.pomodoros === "number") data.pomodoros = b.pomodoros;
  if (b.title) data.title = b.title;
  const task = await prisma.studyTask.update({
    where: { id: Number(b.id) },
    data,
  });
  return NextResponse.json(task);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) await prisma.studyTask.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
