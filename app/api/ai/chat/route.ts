import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { chatWithDeepSeek } from "@/lib/ai";

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  // 拉取近期数据作为上下文
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const [routines, meals, goals, journals] = await Promise.all([
    prisma.routine.findMany({ where: { date: { gte: isoDate(since) } }, orderBy: { date: "desc" } }),
    prisma.meal.findMany({ where: { date: { gte: isoDate(since) } }, orderBy: { date: "desc" } }),
    prisma.studyGoal.findMany({ include: { tasks: true } }),
    prisma.journal.findMany({ where: { date: { gte: isoDate(since) } }, orderBy: { date: "desc" } }),
  ]);

  const context = {
    近期作息: routines,
    近期饮食: meals,
    学习目标: goals.map((g: any) => ({ 目标: g.title, 分类: g.category, 任务: g.tasks })),
    近期日记: journals.map((j: any) => ({ 日期: j.date, 心情: j.mood })),
  };

  const system =
    "你是用户的个人生活助手，运行在一个完全自托管的「生活枢纽」应用中。" +
    "你可以基于用户记录的作息、饮食、学习、日记数据，给出总结、分析和个性化建议。" +
    "回答要简洁、有温度、可操作，使用中文。以下是用户近期的数据（JSON）：\n" +
    JSON.stringify(context, null, 2);

  try {
    const reply = await chatWithDeepSeek([
      { role: "system", content: system },
      { role: "user", content: message },
    ]);
    return NextResponse.json({ reply });
  } catch (e: any) {
    if (e.message === "DEEPSEEK_API_KEY_NOT_SET") {
      return NextResponse.json(
        { error: "AI 尚未配置：请在 .env 中填入 DEEPSEEK_API_KEY 后重启服务。" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "AI 调用失败：" + e.message }, { status: 500 });
  }
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
