import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { codeAgentFunction } from "@/inngest/functions";

/**
 * Inngest API Route Handler
 * 
 * This Next.js API route serves as the webhook endpoint for Inngest
 * background job processing. It handles incoming events and triggers
 * the appropriate background functions.
 * 
 * The route is used by Inngest's infrastructure to:
 * - Receive function invocation requests
 * - Send function execution results
 * - Handle retries and error handling
 * - Provide observability and monitoring data
 * 
 * All background jobs in the application (like AI code generation)
 * are processed through this endpoint.
 */

/**
 * Create Inngest API handlers for Next.js
 * 
 * The serve function creates HTTP handlers that integrate with Inngest's
 * background job processing system. It registers all application functions
 * and handles the communication protocol with Inngest's servers.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,                 // Inngest client configuration
  functions: [
    codeAgentFunction,            // AI code generation background function
    // Add more functions here as the application grows
  ],
});