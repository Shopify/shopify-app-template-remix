import { PrismaClient } from "@prisma/client";

declare global {
  var prismaGlobal: PrismaClient;
}

function isConnectionError(error: any): boolean {
  return (
    error?.message?.includes("Can't reach database server") ||
    error?.message?.includes("Connection refused") ||
    error?.message?.includes("connect ETIMEDOUT") ||
    error?.message?.includes("Connection timed out") ||
    error?.message?.includes("ECONNREFUSED") ||
    error?.message?.includes("socket hang up") ||
    error?.code === "P1001" ||
    error?.code === "P1002"
  );
}

function createPrismaClient() {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = createPrismaClient();
  }
}

const prisma = global.prismaGlobal ?? createPrismaClient();

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (isConnectionError(error) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`[DB] withRetry attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("withRetry: unreachable");
}

export default prisma;
