import { RateLimiterPrisma } from "rate-limiter-flexible";
import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

/**
 * Usage Tracking and Credit Management
 * 
 * This module handles user credit tracking and rate limiting for AI code generation.
 * It implements a tiered system with different limits for free and pro users.
 */

// Credit limits for different user tiers
const FREE_POINTS = 5;      // Free tier: 5 generations per month
const PRO_POINTS = 100;     // Pro tier: 100 generations per month
const DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
const GENERATION_COST = 1;  // Cost per code generation request

/**
 * Creates and configures a usage tracker based on user's plan
 * 
 * @returns Promise<RateLimiterPrisma> - Configured rate limiter instance
 */
export async function getUsageTracker() {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });

  // Configure rate limiter with user-specific limits
  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,           // Use Prisma client for persistence
    tableName: "Usage",            // Database table to store usage data
    points: hasProAccess ? PRO_POINTS : FREE_POINTS, // Credit limit based on plan
    duration: DURATION,            // Reset period (30 days)
  });

  return usageTracker;
}

/**
 * Consumes credits for a code generation request
 * 
 * @throws {Error} If user is not authenticated or has exceeded their limit
 * @returns Promise<object> - Rate limiter result with remaining credits
 */
export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const usageTracker = await getUsageTracker();
  // Consume one credit for the generation request
  const result = await usageTracker.consume(userId, GENERATION_COST);

  return result;
}

/**
 * Gets current usage status for the authenticated user
 * 
 * @throws {Error} If user is not authenticated
 * @returns Promise<object> - Current usage statistics and remaining credits
 */
export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }
  
  const usageTracker = await getUsageTracker();
  // Get current usage without consuming credits
  const result = await usageTracker.get(userId);

  return result;
}
