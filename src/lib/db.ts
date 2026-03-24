import { PrismaClient, Review as PrismaReview } from '@prisma/client'

export type Review = PrismaReview;

// Google Cloud SQL connection string
// Host: 34.35.76.77
// Database: vista_travel
// User: vista_admin
// Password: g^i:ZgmcG`~[o*^P (URL-encoded for special characters)
const DATABASE_URL = 'postgresql://vista_admin:g%5Ei%3AZgmcG%60~%5Bo%2A%5EP@34.35.76.77:5432/vista_travel?sslmode=no-verify&pool_timeout=60&connect_timeout=90'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasourceUrl: DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
