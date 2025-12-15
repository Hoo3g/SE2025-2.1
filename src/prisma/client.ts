import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  errorFormat: 'pretty',
});

prisma.$connect().catch((err) => {
  console.error('Prisma connection error:', err);
  process.exit(1);
});
