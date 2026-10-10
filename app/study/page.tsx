"use client";

import { useEffect, useRef, useState } from "react";

type Task = { id: number; title: string; done: boolean; pomodoros: number };
type Goal = { id: number; title: string; category: string | null; tasks: Task[] };

export default function StudyPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalCat, setNewGoalCat] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [activeGoal, setActiveGoal] = useState<number | null>(null);

  // 番茄钟
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [activeTask, setActiveTask] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    const r = await fetch("/api/study/goals");
    const g = await r.json();
    setGoals(g);
    if (activeGoal === null && g.length) setActiveGoal(g[0].id);
  }
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (running) {
      timer.current = setInterval(() => {
        setSeconds((s) => {
          if (s > 0) return s - 1;
          setMinutes((m) => {
            if (m > 0) return m - 1;
            return 0;
          });
          return 59;
        });
      }, 1000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [running]);

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && running) {
      setRunning(false);
      if (activeTask) {
        const t = goals.flatMap((g) => g.tasks).find((x) => x.id === activeTask);
        if (t) patchTask(t.id, { pomodoros: t.pomodoros + 1 });
      }
    }
  }, [minutes, seconds, running]);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!newGoal.trim()) return;
    await fetch("/api/study/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGoal, category: newGoalCat || null }),
    });
    setNewGoal("");
    setNewGoalCat("");
    load();
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!activeGoal || !taskTitle.trim()) return;
    await fetch("/api/study/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: activeGoal, title: taskTitle }),
    });
    setTaskTitle("");
    load();
  }

  async function patchTask(id: number, data: any) {
    await fetch("/api/study/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    load();
  }

  async function delTask(id: number) {
    await fetch(`/api/study/tasks?id=${id}`, { method: "DELETE" });
    load();
  }
  async function delGoal(id: number) {
    await fetch(`/api/study/goals?id=${id}`, { method: "DELETE" });
    load();
  }

  function startTimer() {
    if (minutes === 0 && seconds === 0) {
      setMinutes(25);
      setSeconds(0);
    }
    setRunning(true);
  }
  function resetTimer() {
    setRunning(false);
    setMinutes(25);
    setSeconds(0);
  }

  const allTasks = goals.flatMap((g) => g.tasks);
  const totalPomo = allTasks.reduce((s, t) => s + t.pomodoros, 0);
  const doneCount = allTasks.filter((t) => t.done).length;

  return (
    <div>
      <h1 className="serif text-3xl font-bold mb-1">学习计划</h1>
      <p className="text-muted text-sm mb-6">
        目标 {goals.length} · 任务 {allTasks.length}（已完成 {doneCount}）· 累计番茄 {totalPomo}
      </p>

      <div className="card p-5 mb-8 text-center">
        <div className="text-5xl font-light tabular-nums mb-3">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <select className="select w-auto" value={activeTask ?? ""}
            onChange={(e) => setActiveTask(Number(e.target.value) || null)}>
            <option value="">选择任务（可选）</option>
            {allTasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center gap-2">
          {!running ? (
            <button className="btn btn-primary" onClick={startTimer}>开始专注</button>
          ) : (
            <button className="btn" onClick={() => setRunning(false)}>暂停</button>
          )}
          <button className="btn" onClick={resetTimer}>重置</button>
        </div>
      </div>

      <form onSubmit={addGoal} className="card p-5 mb-6 grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs text-muted">学习目标</label>
          <input className="input mt-1" value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)} placeholder="例如：备考雅思" />
        </div>
        <div>
          <label className="text-xs text-muted">分类（可选）</label>
          <input className="input mt-1" value={newGoalCat}
            onChange={(e) => setNewGoalCat(e.target.value)} placeholder="英语" />
        </div>
        <div className="col-span-2">
          <button className="btn btn-primary">添加目标</button>
        </div>
      </form>

      <div className="space-y-4">
        {goals.map((g) => (
          <div key={g.id} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium">{g.title}</span>
                {g.category && <span className="text-xs text-dim ml-2">{g.category}</span>}
              </div>
              <button onClick={() => delGoal(g.id)} className="text-dim hover:text-diet text-sm">删除</button>
            </div>
            <div className="space-y-2">
              {g.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={t.done}
                    onChange={(e) => patchTask(t.id, { done: e.target.checked })} />
                  <span className={t.done ? "line-through text-dim" : ""}>{t.title}</span>
                  <span className="text-xs text-study ml-auto">🍅 {t.pomodoros}</span>
                  <button onClick={() => delTask(t.id)} className="text-dim hover:text-diet">×</button>
                </div>
              ))}
              {g.tasks.length === 0 && <p className="text-dim text-sm">暂无任务</p>}
            </div>
            {activeGoal === g.id ? (
              <form onSubmit={addTask} className="flex gap-2 mt-3">
                <input className="input text-sm" value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)} placeholder="新任务…" />
                <button className="btn btn-primary text-sm">添加</button>
              </form>
            ) : (
              <button onClick={() => setActiveGoal(g.id)} className="text-xs text-muted mt-3 hover:text-fg">
                + 添加任务到「{g.title}」
              </button>
            )}
          </div>
        ))}
        {goals.length === 0 && <p className="text-dim text-sm">先添加一个学习目标吧。</p>}
      </div>
    </div>
  );
}
