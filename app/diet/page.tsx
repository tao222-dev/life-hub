"use client";

import { useEffect, useRef, useState } from "react";

type Meal = {
  id: number;
  date: string;
  type: string;
  content: string;
  calories: number | null;
  note: string | null;
  imageUrl: string | null;
};

const TYPES = [
  { v: "breakfast", l: "早餐" },
  { v: "lunch", l: "午餐" },
  { v: "dinner", l: "晚餐" },
  { v: "snack", l: "加餐" },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DietPage() {
  const [items, setItems] = useState<Meal[]>([]);
  const [form, setForm] = useState({ date: today(), type: "breakfast", content: "", calories: "", note: "" });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch("/api/diet");
    setItems(await r.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let imageUrl: string | null = null;
    if (file) {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/diet/upload", { method: "POST", body: fd });
      const u = await up.json();
      imageUrl = u.url || null;
      setUploading(false);
    }
    await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, calories: form.calories ? Number(form.calories) : null, imageUrl }),
    });
    setSaving(false);
    setForm({ date: today(), type: "breakfast", content: "", calories: "", note: "" });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function remove(id: number) {
    await fetch(`/api/diet?id=${id}`, { method: "DELETE" });
    load();
  }

  const total = items.reduce((s, m) => s + (m.calories || 0), 0);

  return (
    <div>
      <h1 className="serif text-3xl font-bold mb-1">饮食记录</h1>
      <p className="text-muted text-sm mb-6">记录每一餐，回看你的饮食结构。共 {items.length} 条，合计 {total} kcal。</p>

      <form onSubmit={submit} className="card p-5 mb-8 grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted">日期</label>
          <input type="date" className="input mt-1" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted">餐别</label>
          <select className="select mt-1" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>{t.l}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted">吃了什么</label>
          <input className="input mt-1" value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="例如：番茄炒蛋、米饭" required />
        </div>
        <div>
          <label className="text-xs text-muted">热量 (kcal，可选)</label>
          <input type="number" className="input mt-1" value={form.calories}
            onChange={(e) => setForm({ ...form, calories: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-muted">拍照 (可选)</label>
          <input ref={fileRef} type="file" accept="image/*" className="input mt-1"
            onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-muted">备注</label>
          <input className="input mt-1" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="食材、感受…" />
        </div>
        <div className="col-span-2">
          <button className="btn btn-primary" disabled={saving || uploading}>
            {saving ? "保存中…" : uploading ? "上传图片中…" : "保存记录"}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {items.map((m) => (
          <div key={m.id} className="card p-4 flex gap-4">
            {m.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{TYPES.find((t) => t.v === m.type)?.l}</span>
                <span className="text-xs text-dim">{m.date}</span>
                {m.calories != null && <span className="text-xs text-diet">{m.calories} kcal</span>}
              </div>
              <div className="text-sm text-muted mt-1">{m.content}</div>
              {m.note && <div className="text-sm text-dim mt-1">{m.note}</div>}
            </div>
            <button onClick={() => remove(m.id)} className="text-dim hover:text-diet text-sm self-start">
              删除
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-dim text-sm">还没有记录，添加第一条吧。</p>}
      </div>
    </div>
  );
}
