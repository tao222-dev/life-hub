"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Routine = {
  id: number;
  date: string;
  wakeAt: string | null;
  sleepAt: string | null;
  quality: number;
  note: string | null;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}
function toLocalInput(d: Date | null) {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export default function RoutinePage() {
  const [items, setItems] = useState<Routine[]>([]);
  const [form, setForm] = useState({
    date: today(),
    wakeAt: "",
    sleepAt: "",
    quality: 3,
    note: "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/routine");
    setItems(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/routine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm({ date: today(), wakeAt: "", sleepAt: "", quality: 3, note: "" });
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/routine?id=${id}`, { method: "DELETE" });
    load();
  }

  const chartData = items
    .slice()
    .reverse()
    .map((it) => {
      let dur: number | null = null;
      if (it.wakeAt && it.sleepAt) {
        const w = new Date(it.wakeAt).getTime();
        const s = new Date(it.sleepAt).getTime();
        dur = Math.round(((w - s) / 3600000) * 10) / 10;
      }
      return { date: it.date.slice(5), 时长: dur, 质量: it.quality };
    })
    .filter((d) => d.时长 !== null);

  return (
    <div>
      <h1 className="serif text-3xl font-bold mb-1">作息管理</h1>
      <p className="text-muted text-sm mb-6">记录每日睡眠，洞察你的生活节奏。</p>

      <form onSubmit={submit} className="card p-5 mb-8 grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted">日期</label>
          <input type="date" className="input mt-1" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted">睡眠质量 {form.quality}/5</label>
          <input type="range" min={1} max={5} value={form.quality} className="w-full mt-2"
            onChange={(e) => setForm({ ...form, quality: Number(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-muted">入睡时间</label>
          <input type="datetime-local" className="input mt-1" value={form.sleepAt}
            onChange={(e) => setForm({ ...form, sleepAt: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted">起床时间</label>
          <input type="datetime-local" className="input mt-1" value={form.wakeAt}
            onChange={(e) => setForm({ ...form, wakeAt: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted">备注</label>
          <input className="input mt-1" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="可选" />
        </div>
        <div className="col-span-2">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "保存中…" : "保存记录"}
          </button>
        </div>
      </form>

      {chartData.length > 0 && (
        <div className="card p-5 mb-8">
          <h2 className="serif text-lg font-semibold mb-3">睡眠时长趋势（小时）</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--fg-dim)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--fg-dim)" />
              <Tooltip />
              <Line type="monotone" dataKey="时长" stroke="#3D7A6B" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="质量" stroke="#C4704B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.date}</div>
              <div className="text-sm text-muted">
                睡 {it.sleepAt ? toLocalInput(new Date(it.sleepAt)).slice(11, 16) : "—"} ·
                起 {it.wakeAt ? toLocalInput(new Date(it.wakeAt)).slice(11, 16) : "—"} ·
                质量 {it.quality}/5
              </div>
              {it.note && <div className="text-sm text-dim mt-1">{it.note}</div>}
            </div>
            <button onClick={() => remove(it.id)} className="text-dim hover:text-diet text-sm">
              删除
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-dim text-sm">还没有记录，添加第一条吧。</p>}
      </div>
    </div>
  );
}
