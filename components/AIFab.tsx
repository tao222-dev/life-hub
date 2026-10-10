"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [
  "总结本周作息规律",
  "分析饮食营养均衡",
  "生成学习进度报告",
  "基于日记的情绪洞察",
  "给我一些个性化改善建议",
];

export default function AIFab() {
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // 拖拽
  useEffect(() => {
    const fab = fabRef.current;
    if (!fab) return;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    const onStart = (e: any) => {
      dragging = true;
      moved = false;
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      const r = fab.getBoundingClientRect();
      originX = r.left;
      originY = r.top;
      fab.style.transition = "none";
    };
    const onMove = (e: any) => {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      e.preventDefault?.();
      let nx = originX + dx;
      let ny = originY + dy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      nx = Math.max(0, Math.min(nx, vw - 56));
      ny = Math.max(0, Math.min(ny, vh - 56));
      setPos({ x: nx, y: ny });
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      fab.style.transition = "";
      if (!moved) setOpen((o) => !o);
    };

    fab.addEventListener("mousedown", onStart);
    fab.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      fab.removeEventListener("mousedown", onStart);
      fab.removeEventListener("touchstart", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: any) {
      if (!open) return;
      if (panelRef.current?.contains(e.target)) return;
      if (fabRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onDocClick);
    return () => document.removeEventListener("pointerdown", onDocClick);
  }, [open]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setReply("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReply(data.error || "请求失败");
      } else {
        setReply(data.reply);
      }
    } catch (e: any) {
      setReply("网络错误：" + e.message);
    } finally {
      setLoading(false);
    }
  }

  const fabStyle = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", position: "fixed" as const }
    : {};

  const panelStyle = pos
    ? { left: Math.max(16, pos.x + 56 - 280), top: Math.max(8, pos.y - 280 - 12), position: "fixed" as const }
    : {};

  return (
    <>
      <button
        ref={fabRef}
        aria-label="AI 助手"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-ai text-bg flex items-center justify-center shadow-lg z-50"
        style={fabStyle}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 014 4v1a1 1 0 001 1h1a4 4 0 010 8h-1a1 1 0 00-1 1v1a4 4 0 01-8 0v-1a1 1 0 00-1-1H6a4 4 0 010-8h1a1 1 0 001-1V6a4 4 0 014-4z" />
        </svg>
      </button>

      <div
        ref={panelRef}
        className={`card fixed bottom-[100px] right-6 w-[280px] p-5 shadow-xl z-40 transition ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={panelStyle}
      >
        <p className="serif font-semibold text-base mb-1">AI 助手</p>
        <p className="text-xs text-muted mb-3">基于你的生活数据给出分析与建议</p>
        <div className="flex flex-col gap-2 mb-3">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-left text-xs text-muted hover:text-fg border border-border rounded-md px-3 py-2"
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="自由提问…"
            className="input text-xs"
          />
          <button onClick={() => send(input)} className="btn btn-primary text-xs whitespace-nowrap">
            发送
          </button>
        </div>
        {loading && <p className="text-xs text-dim mt-3">思考中…</p>}
        {reply && (
          <div className="text-xs text-fg mt-3 max-h-48 overflow-auto whitespace-pre-wrap border-t border-border pt-2">
            {reply}
          </div>
        )}
      </div>
    </>
  );
}
