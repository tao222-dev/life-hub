# 生活枢纽 · 部署到 Vercel 指引

本应用已改造为 **Vercel 友好**架构：
- 数据库：Neon（Postgres，云端持久化，替代本地 SQLite）
- 图片：饮食照片转为 base64 直接存进数据库（无需 Vercel Blob）
- 鉴权 / AI：保持不变（单密码 + DeepSeek）

## 一、准备 Neon 数据库（免费）

1. 打开 https://neon.tech 注册并新建一个 Project。
2. 在 Dashboard 找到 **Connection Details**，复制 **Pooled connection string**（格式类似
   `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`）。
3. 先在本地的 `.env` 里把 `DATABASE_URL` 改成这个串，然后执行建表：
   ```bash
   export PATH="/Users/mumu1121mumuhotmail.com/.workbuddy/binaries/node/versions/22.22.2-3/bin:$PATH"
   cd /你的项目目录
   ./node_modules/.bin/prisma db push
   ```
   （会按 `prisma/schema.prisma` 在 Neon 上建好所有表。）

## 二、准备 Vercel 账号与项目

方式 A（推荐，最简单）：
1. 把本项目推到 GitHub。
2. 打开 https://vercel.com → New Project → 导入该仓库 → Deploy。
3. 在部署前/后到 **Settings → Environment Variables** 加入 `.env.example` 里的全部变量
   （`SITE_PASSWORD` / `APP_SESSION_SECRET` / `DATABASE_URL` / `DEEPSEEK_API_KEY` / `DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL`）。
4. 重新 Deploy 即可。

方式 B（用 CLI，需本机能开浏览器登录）：
```bash
export PATH="/Users/mumu1121mumuhotmail.com/.workbuddy/binaries/node/versions/22.22.2-3/bin:$PATH"
npm i -g vercel
vercel login          # 浏览器授权
vercel                # 预览部署
vercel --prod         # 正式部署（同样在 dashboard 里设好环境变量）
```

## 三、验证

- 打开分配的 `https://xxx.vercel.app`，用 `SITE_PASSWORD` 登录。
- 在任意设备访问同一地址，数据互通（因为都在 Neon 云端）。
- AI 悬浮球需要 `DEEPSEEK_API_KEY` 才返回真实内容，没填会友好报错。

## 四、注意事项

- Vercel 是无状态环境，**不能写本地文件**，所以图片已改为存数据库。若以后照片很多、想省数据库空间，可再升级为 Vercel Blob。
- 想改密码：改 `SITE_PASSWORD` 环境变量后重新部署。
- 想本地开发：把 `.env` 的 `DATABASE_URL` 也设成 Neon 串即可，本地和线上共用同一数据库（注意多人同时用会共享数据）。
