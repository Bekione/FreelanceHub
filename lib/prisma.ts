import { PrismaClient } from "@/lib/generated/prisma/client";

// Prisma 7 + Prisma Postgres: pass datasourceUrl explicitly.
// This makes the client work with Prisma's hosted service (db.prisma.io / Accelerate).
function createPrismaClient() {
  return new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
} as any);
}

// Singleton — prevents multiple instances during Next.js hot-reload in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
