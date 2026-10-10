"use client";

import { useEffect, useRef, useState } from "react";

const MOODS = ["😊", "😐", "😟", "😡", "😴", "🤩"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalPage() {
  const [date, setDate] = useState(today());
  const [mood, setMood] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  async function loadList() {
    const r = await fetch("/api/journal");
    setItems(await r.json());
  }
  useEffect(() => {
    loadList();
  }, []);

  async function loadDate(d: string) {
    setDate(d);
    const r = await fetch(`/api/journal?date=${d}`);
    const j = await r.json();
    if (editorRef.current) editorRef.current.innerHTML = j?.content || "";
    setMood(j?.mood || "");
  }

  async function save() {
    setSaving(true);
    const content = editorRef.current?.innerHTML || "";
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, content, mood }),
    });
    setSaving(false);
    loadList();
  }

  function exec(cmd: string) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  }

  return (
    <div>
      <h1 className="serif text-3xl font-bold mb-1">每日日记</h1>
      <p className="text-muted text-sm mb-6">自由书写，按日期归档。</p>

      <div className="card p-5 mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <input type="date" className="input w-auto" value={date}
            onChange={(e) => loadDate(e.target.value)} />
          <div className="flex gap-1">
            {MOODS.map((m) => (
              <button key={m} onClick={() => setMood(m)}
                className={`text-xl px-1 ${mood === m ? "scale-125" : "opacity-50"}`}>
                {m}
              </button>
            ))}
          </div>
          <button onClick={save} className="btn btn-primary ml-auto" disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => exec("bold")} className="btn text-sm font-bold">B</button>
          <button onClick={() => exec("italic")} className="btn text-sm italic">I</button>
          <button onClick={() => exec("insertUnorderedList")} className="btn text-sm">• 列表</button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[200px] border border-border rounded-lg p-3 text-sm leading-relaxed focus:outline-none"
          data-placeholder="今天发生了什么…"
        />
      </div>

      <div className="space-y-3">
        {items.map((j) => (
          <button key={j.id} onClick={() => loadDate(j.date)}
            className="card p-4 w-full text-left block hover:-translate-y-0.5 transition">
            <div className="flex items-center gap-2">
              <span className="font-medium">{j.date}</span>
              {j.mood && <span>{j.mood}</span>}
            </div>
            <div className="text-sm text-muted mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: j.content?.replace(/<[^>]+>/g, " ").slice(0, 80) || "（空）" }} />
          </button>
        ))}
        {items.length === 0 && <p className="text-dim text-sm">还没有日记，写下第一篇吧。</p>}
      </div>
    </div>
  );
}
