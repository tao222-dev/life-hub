"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "概览" },
  { href: "/routine", label: "作息" },
  { href: "/diet", label: "饮食" },
  { href: "/study", label: "学习" },
  { href: "/journal", label: "日记" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    // 登录页不需要导航
    setAuthed(pathname !== "/login");
  }, [pathname]);

  if (!authed) return null;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b border-border sticky top-0 bg-bg/90 backdrop-blur z-40">
      <div className="max-w-[960px] mx-auto px-6 h-14 flex items-center gap-1 text-sm">
        <span className="serif font-semibold mr-4">生活枢纽</span>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-md ${
              pathname === l.href
                ? "bg-card text-fg"
                : "text-muted hover:text-fg"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <button
          onClick={logout}
          className="ml-auto text-dim hover:text-fg text-xs"
        >
          退出
        </button>
      </div>
    </nav>
  );
}
