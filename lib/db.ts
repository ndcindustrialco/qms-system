import { PrismaClient } from "../app/generated/prisma";

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // Local dev: use pg adapter (Node.js only)
  const pgName = "pg";
  const pgAdapterName = "@prisma/adapter-pg";
  const pg = typeof require !== "undefined" ? require(pgName) : null;
  const { PrismaPg } = typeof require !== "undefined" ? require(pgAdapterName) : { PrismaPg: null };
  if (!pg || !PrismaPg) {
    throw new Error("Local pg adapter is required in development environment");
  }
  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
