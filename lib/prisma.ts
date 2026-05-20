import { PrismaClient } from "../app/generated/prisma/edge";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

function getPrismaInstance() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  return new PrismaClient({
    accelerateUrl: url,
  });
}

export const prisma = globalForPrisma.prisma || getPrismaInstance();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
