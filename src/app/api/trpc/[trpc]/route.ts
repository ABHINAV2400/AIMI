import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

/**
 * tRPC API Route Handler
 * 
 * This Next.js API route handles all tRPC requests using the fetch adapter.
 * It provides type-safe API endpoints for the entire application.
 * 
 * The route handles both GET and POST requests at /api/trpc/[procedure]
 * where [procedure] can be any tRPC procedure like:
 * - /api/trpc/projects.create
 * - /api/trpc/messages.getMany
 * - /api/trpc/usage.status
 * 
 * All requests are authenticated via Clerk middleware and include
 * user context in the tRPC context.
 */

/**
 * Main tRPC request handler
 * 
 * Processes incoming tRPC requests and routes them to the appropriate
 * procedures in the app router with proper context creation.
 * 
 * @param req - The incoming HTTP request
 * @returns Response from the appropriate tRPC procedure
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",        // Base endpoint for tRPC requests
    req,                          // Pass through the request
    router: appRouter,            // Main application router
    createContext: createTRPCContext, // Create context with auth info
  });

/**
 * Export handlers for both GET and POST methods
 * 
 * GET: Used for queries (data fetching)
 * POST: Used for mutations (data modification)
 */
export { handler as GET, handler as POST };
