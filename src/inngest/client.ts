import { Inngest } from "inngest";

/**
 * Inngest Client Configuration
 * 
 * This client handles background job processing for the application,
 * particularly AI code generation tasks that run asynchronously.
 * 
 * Inngest provides reliable, durable execution of background functions
 * with built-in retries, observability, and step-based execution.
 */
export const inngest = new Inngest({
  id: "lovable", // Unique identifier for this Inngest application
});