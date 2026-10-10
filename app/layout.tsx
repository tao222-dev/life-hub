import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import AIFab from "@/components/AIFab";

export const metadata: Metadata = {
  title: "生活枢纽",
  description: "个人生活管理 · 作息 / 饮食 / 学习 / 日记",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap"
        />
      </head>
      <body>
        <Nav />
        <main className="max-w-[960px] mx-auto px-6 py-10">{children}</main>
        <AIFab />
      </body>
    </html>
  );
}
