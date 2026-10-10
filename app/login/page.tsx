"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("密码错误");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm">
        <h1 className="serif text-2xl font-semibold mb-2">生活枢纽</h1>
        <p className="text-sm text-muted mb-6">请输入进门密码以继续使用</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          className="input mb-3"
          autoFocus
        />
        {error && <p className="text-diet text-sm mb-3">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "验证中…" : "进入"}
        </button>
      </form>
    </div>
  );
}
