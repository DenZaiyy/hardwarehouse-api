import {PrismaClient} from '@/app/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db