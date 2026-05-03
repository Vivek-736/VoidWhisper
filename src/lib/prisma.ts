import { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getDatabaseConnectionString() {
  const rawUrl = process.env.DATABASE_URL ?? ""

  if (!rawUrl) {
    return rawUrl
  }

  const url = new URL(rawUrl)
  const sslMode = url.searchParams.get("sslmode")

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    url.searchParams.set("sslmode", "verify-full")
  }

  return url.toString()
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: getDatabaseConnectionString(),
  })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}