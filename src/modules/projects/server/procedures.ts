import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/db";
import { consumeCredits } from "@/lib/usage";
import { protectedProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { generateSlug } from "random-word-slugs";
import { z } from "zod";

/**
 * Projects Router - tRPC procedures for project management
 * 
 * This router handles all project-related operations including:
 * - Creating new projects with AI code generation
 * - Retrieving single projects by ID
 * - Listing all user projects
 * 
 * All procedures are protected and require user authentication.
 */
export const projectsRouter = createTRPCRouter({
  /**
   * Get a single project by ID
   * 
   * Validates that the project exists and belongs to the authenticated user.
   * Used for loading project details and associated messages.
   * 
   * @input {string} id - The project ID to retrieve
   * @returns {Project} The project data
   * @throws {NOT_FOUND} If project doesn't exist or doesn't belong to user
   */
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: "ID is required" }),
      })
    )
    .query(async ({ input, ctx }) => {
      const existingProject = await prisma.project.findUnique({
        where: {
          id: input.id,
          userId: ctx.auth.userId, // Ensure user owns this project
        },
      });

      if (!existingProject) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return existingProject;
    }),

  /**
   * Get all projects for the authenticated user
   * 
   * Returns a list of all projects owned by the current user,
   * ordered by last updated (oldest first).
   * 
   * @returns {Project[]} Array of user's projects
   */
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const projects = await prisma.project.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      orderBy: {
        updatedAt: "asc", // Show oldest projects first
      },
    });

    return projects;
  }),

  /**
   * Create a new project with AI code generation
   * 
   * This procedure:
   * 1. Validates user input (project description)
   * 2. Consumes user credits (rate limiting)
   * 3. Creates a new project with auto-generated name
   * 4. Creates the initial user message
   * 5. Triggers background AI code generation via Inngest
   * 
   * @input {string} value - User's project description/prompt (1-10000 chars)
   * @returns {Project} The newly created project
   * @throws {BAD_REQUEST} If credit consumption fails unexpectedly
   * @throws {TOO_MANY_REQUESTS} If user has exceeded their credit limit
   */
  create: protectedProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: "Value is required" })
          .max(10000, { message: "Value is too long" }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check and consume user credits before proceeding
      try {
        await consumeCredits();
      } catch (error) {
        if (error instanceof Error) {
          // Unexpected error during credit consumption
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Something went wrong",
          });
        } else {
          // Rate limit exceeded - user is out of credits
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "You have run out of credits",
          });
        }
      }

      // Create new project with generated name and initial message
      const createdProject = await prisma.project.create({
        data: {
          userId: ctx.auth.userId,
          name: generateSlug(2, {
            format: "kebab", // e.g., "happy-turtle", "clever-fox"
          }),
          messages: {
            create: {
              content: input.value,  // User's initial prompt
              role: "USER",
              type: "RESULT",
            },
          },
        },
      });

      // Trigger background AI code generation job
      await inngest.send({
        name: "code-agent/run",
        data: { 
          value: input.value, 
          projectId: createdProject.id 
        },
      });

      return createdProject;
    }),
});
