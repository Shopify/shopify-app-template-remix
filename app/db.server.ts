import {PrismaClient} from '@prisma/client';

declare global {
  const prisma: PrismaClient;
}

const prisma: PrismaClient = new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}

export default prisma;
