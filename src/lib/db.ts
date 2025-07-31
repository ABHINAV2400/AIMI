import { PrismaClient } from "@/generated/prisma";

/**
 * Database Connection Manager
 * 
 * This module creates and manages a singleton Prisma client instance
 * to prevent connection pool exhaustion during development.
 * 
 * In development mode, the Prisma client is attached to the global object
 * to prevent hot reloading from creating new instances.
 */

/**
 * Global object type extension for storing Prisma client
 * This prevents TypeScript errors when accessing global.prisma
 */
const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

/**
 * Singleton Prisma client instance
 * 
 * In production: Creates a new PrismaClient instance
 * In development: Reuses the existing instance from global to prevent
 * "too many connections" errors during hot reloading
 */
export const prisma = globalForPrisma.prisma || new PrismaClient()

/**
 * Store Prisma client in global object during development
 * This ensures the same instance is reused across hot reloads
 */
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

