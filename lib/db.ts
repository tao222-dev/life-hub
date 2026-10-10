import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// 标准 PrismaClient + Neon 的 Pooled 连接串（DATABASE_URL 用 -pooler 端点）。
// Neon 侧已做连接池，serverless 下复用安全；globalThis 缓存避免重复实例化。
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
