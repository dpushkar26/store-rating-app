const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'], // Keep logs clean, only show issues
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;