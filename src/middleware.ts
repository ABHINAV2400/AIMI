import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Authentication Middleware using Clerk
 * 
 * This middleware handles authentication for the entire application,
 * protecting routes that require user authentication while allowing
 * public access to specified routes.
 */

/**
 * Define routes that don't require authentication
 * These routes are accessible to all users without signing in
 */
const isPublicRoute = createRouteMatcher([
  "/",                 // Home page
  "/sign-in(.*)",      // Sign-in page and sub-routes
  "/sign-up(.*)",      // Sign-up page and sub-routes
  "/api(.*)",          // All API routes (handled separately)
  "/pricing(.*)"       // Pricing page and sub-routes
]);

/**
 * Main middleware function
 * Runs on every request and determines whether authentication is required
 */
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

/**
 * Middleware configuration
 * Defines which routes this middleware should run on
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // This regex excludes: _next folder, static files (images, fonts, etc.)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    
    // Always run middleware for API routes to ensure proper authentication
    "/(api|trpc)(.*)",
  ],
};
