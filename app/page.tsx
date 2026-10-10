import Link from "next/link";

const modules = [
  {
    href: "/routine",
    title: "作息管理",
    desc: "记录每日起床与入睡时间，追踪睡眠质量和作息规律。通过时间线和趋势图直观了解自己的生活节奏。",
    tags: ["睡眠记录", "时间线", "趋势分析"],
    accent: "routine",
  },
  {
    href: "/diet",
    title: "饮食记录",
    desc: "记录三餐与加餐的内容和时间，可备注食材或热量，并拍照留存。回顾饮食结构的变化。",
    tags: ["三餐记录", "营养参考", "饮食回顾"],
    accent: "diet",
  },
  {
    href: "/study",
    title: "学习计划",
    desc: "制定学习目标与每日任务，用番茄钟专注学习，追踪完成进度。按科目或项目分类。",
    tags: ["目标管理", "番茄钟", "进度追踪"],
    accent: "study",
  },
  {
    href: "/journal",
    title: "每日日记",
    desc: "自由书写每天的所思所感，支持富文本编辑。按日期归档，随时翻阅过去的自己。",
    tags: ["富文本编辑", "日期归档", "心情标记"],
    accent: "journal",
  },
];

const accentMap: Record<string, { bg: string; fg: string }> = {
  routine: { bg: "#EDF5F2", fg: "#3D7A6B" },
  diet: { bg: "#FDF0EA", fg: "#C4704B" },
  study: { bg: "#EDF1F7", fg: "#4A6FA5" },
  journal: { bg: "#F3EFF7", fg: "#8B6DAF" },
};

function todayLabel() {
  const now = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${w}`;
}

export default function Home() {
  return (
    <div>
      <header className="mb-12">
        <div className="text-xs font-medium tracking-widest uppercase text-dim mb-4">
          {todayLabel()}
        </div>
        <h1 className="serif text-[clamp(32px,5vw,44px)] font-bold leading-tight">
          我的生活枢纽
        </h1>
        <p className="text-base text-muted mt-3 max-w-md">
          管理作息、记录饮食、规划学习、书写日记，并在 AI 助手的帮助下让每一天更有条理。
        </p>
      </header>

      <div className="module-grid">
        {modules.map((m) => {
          const a = accentMap[m.accent];
          return (
            <Link key={m.href} href={m.href} className="card p-7 flex flex-col gap-4 hover:-translate-y-0.5 transition">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: a.bg, color: a.fg }}
              >
                <span className="serif font-bold">{m.title[0]}</span>
              </div>
              <h2 className="serif text-xl font-semibold">{m.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{m.desc}</p>
              <div className="flex flex-wrap gap-2 mt-auto pt-1">
                {m.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium px-2.5 py-1 rounded-md"
                    style={{ background: a.bg, color: a.fg }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-14 pt-6 border-t border-border flex justify-between items-center text-xs text-dim">
        <span>
          <span className="inline-block w-2 h-2 rounded-full bg-routine mr-2" />
          所有数据仅存储在你自己的服务器
        </span>
        <span>v0.1</span>
      </footer>
    </div>
  );
}
