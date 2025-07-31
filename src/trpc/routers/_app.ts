import { projectsRouter } from "@/modules/projects/server/procedures";
import { createTRPCRouter } from "../init";
import { messagesRouter } from "@/modules/messages/server/procedures";
import { usageRouter } from "@/modules/usage/server/procedures";

/**
 * Main tRPC Application Router
 * 
 * This is the central router that combines all feature-specific routers
 * into a single API surface. Each router handles a specific domain of the application.
 */
export const appRouter = createTRPCRouter({
  /**
   * Messages router - handles chat messages and AI interactions
   * Routes: messages.create, messages.list, messages.delete
   */
  messages: messagesRouter,
  
  /**
   * Projects router - handles project CRUD operations
   * Routes: projects.create, projects.getOne, projects.getMany
   */
  projects: projectsRouter,
  
  /**
   * Usage router - handles user credit tracking and limits
   * Routes: usage.get, usage.update
   */
  usage: usageRouter,
});

/**
 * Export the router type definition for client-side type safety
 * This enables full TypeScript inference across the client-server boundary
 */
export type AppRouter = typeof appRouter;
