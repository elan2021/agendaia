import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const url = process.env.DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({ url, authToken })

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// TEMP: Forçando renovação para detectar novas colunas (remover após salvar com sucesso)
const prismaInstance = new PrismaClient({ adapter })

export const prisma = prismaInstance
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export function getTenantPrisma(url: string, authToken: string) {
  const adapter = new PrismaLibSql({ url, authToken })
  return new PrismaClient({ adapter })
}
