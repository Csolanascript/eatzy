// prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global; // Para evitar errores en TypeScript

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
