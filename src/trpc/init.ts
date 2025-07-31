import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { isatty } from "tty";

/**
 * tRPC Configuration and Initialization
 * 
 * This file sets up the tRPC server with authentication middleware,
 * context creation, and base procedure definitions.
 */

/**
 * Creates the tRPC context for each request
 * Includes authentication information from Clerk
 * 
 * @returns Promise<{auth: AuthObject}> - Context object with auth info
 */
export const createTRPCContext = cache(async () => {
  return { auth: await auth() };
});

/**
 * Type definition for the tRPC context
 */
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC with context and transformer
 * 
 * Note: We avoid exporting the entire t-object since it's not very descriptive.
 * The use of a 't' variable is common in i18n libraries and could cause confusion.
 */
const t = initTRPC.context<Context>().create({
  /**
   * Data transformer for serializing/deserializing complex types
   * SuperJSON handles Date objects, RegExp, Map, Set, BigInt, etc.
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

/**
 * Authentication middleware
 * Ensures the user is authenticated before accessing protected procedures
 * 
 * @throws {TRPCError} UNAUTHORIZED - If user is not authenticated
 */
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

/**
 * Base router and procedure helpers
 * These are the building blocks for creating tRPC routers and procedures
 */
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

/**
 * Base procedure - no authentication required
 * Use for public endpoints that don't require user authentication
 */
export const baseProcedure = t.procedure;

/**
 * Protected procedure - authentication required
 * Use for endpoints that require user authentication
 * Automatically includes user auth information in the context
 */
export const protectedProcedure = t.procedure.use(isAuthed);
