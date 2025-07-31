import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";

import { inngest } from "./client";
import {
  getSandbox,
  lastAgentTextMessageContent,
  parseAgentOutput,
} from "./utils";
import { z } from "zod";
import { PROMPT, FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "./types";

/**
 * AI Code Generation Background Function
 * 
 * This Inngest function handles the complex process of AI-powered code generation:
 * 1. Creates an isolated E2B sandbox environment
 * 2. Sets up an AI agent with coding tools
 * 3. Processes user prompts to generate code
 * 4. Manages file operations and terminal commands
 * 5. Returns generated code and live preview URL
 * 
 * The function uses a multi-agent approach with specialized agents for
 * different tasks (coding, title generation, response formatting).
 */

/**
 * State interface for the AI agent
 * Tracks the current state of code generation and file management
 */
interface AgentState {
  summary: string;                        // AI-generated summary of the task
  files: { [path: string]: string };     // Generated files and their content
}

/**
 * Main code generation function
 * 
 * Triggered by "code-agent/run" events from the tRPC projects.create procedure.
 * Handles the entire lifecycle of AI code generation in isolated steps.
 * 
 * @param event.data.value - User's project description/prompt
 * @param event.data.projectId - Database ID of the project to generate code for
 */
export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    // Step 1: Create isolated sandbox environment
    const sandboxId = await step.run("get-sandbox-id", async () => {
      // Create a new E2B sandbox with pre-configured Next.js environment
      const sandbox = await Sandbox.create("lovable-test-build");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });

    // Step 2: Load conversation history for context
    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        // Get the last 5 messages from this project for context
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Limit to recent messages to avoid token limits
        });

        // Convert database messages to agent message format
        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        // Reverse to get chronological order (oldest first)
        return formattedMessages.reverse();
      }
    );

    // Step 3: Initialize agent state and configuration
    const state = createState<AgentState>(
      {
        summary: "",    // Will store AI-generated task summary
        files: {},      // Will store generated files and their content
      },
      {
        messages: previousMessages, // Include conversation history
      }
    );

    // Step 4: Create the main coding agent with tools
    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent that can create and modify files",
      system: PROMPT, // Main system prompt for code generation
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1, // Low temperature for consistent, focused output
        },
      }),
      tools: [
        /**
         * Terminal Tool - Execute shell commands in the sandbox
         * 
         * Allows the AI agent to run terminal commands like npm install,
         * build scripts, test commands, etc. in the isolated sandbox environment.
         */
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands like npm install, build, test, etc.",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr(data: string) {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `Command failed ${error}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),

        /**
         * File Creation/Update Tool - Write files to the sandbox
         * 
         * Allows the AI agent to create or modify files in the sandbox.
         * Updates both the sandbox filesystem and the agent's internal state
         * to track all generated files.
         */
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox (React components, configs, etc.)",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),    // File path relative to project root
                content: z.string(), // Full file content
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);
                  
                  // Write each file to the sandbox and update state
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return "Error: " + error;
                }
              }
            );

            // Update agent state with new files
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        /**
         * File Reading Tool - Read existing files from the sandbox
         * 
         * Allows the AI agent to examine existing files to understand
         * the project structure and make informed decisions about modifications.
         */
        createTool({
          name: "readFiles",
          description: "Read existing files from the sandbox to understand project structure",
          parameters: z.object({
            files: z.array(z.string()), // Array of file paths to read
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                
                // Read each requested file
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return "Error: " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        /**
         * Response lifecycle hook
         * Extracts task summaries from agent responses and updates state
         */
        onResponse: async ({ result, network }) => {
          const lastAgentTextMessageText = lastAgentTextMessageContent(result);

          if (lastAgentTextMessageText && network) {
            // Look for task summary in agent response
            if (lastAgentTextMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAgentTextMessageText;
            }
          }
          return result;
        },
      },
    });

    // Step 5: Create agent network with routing logic
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15, // Maximum iterations to prevent infinite loops
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        // Stop when agent provides a task summary (indicates completion)
        if (summary) {
          return; // No agent = stop execution
        }
        return codeAgent; // Continue with main coding agent
      },
    });

    // Step 6: Execute the main code generation
    const result = await network.run(event.data.value, { state });

    // Step 7: Generate user-friendly title and response
    const fragmentTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "Generates concise, descriptive titles for code fragments",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "Generates user-friendly responses explaining the generated code",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
      }),
    });

    // Generate title and response based on the summary
    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    // Check if generation was successful
    const isError =
      !result.state.data.summary || // No summary means agent didn't complete
      Object.keys(result.state.data.files || {}).length === 0; // No files generated

    // Step 8: Get the live preview URL
    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000); // Next.js dev server port
      return `https://${host}`;
    });

    // Step 9: Save results to database
    await step.run("save-result", async () => {
      if (isError) {
        // Create error message if generation failed
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      // Create success message with fragment data
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: parseAgentOutput(responseOutput),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,                                    // Live preview URL
              title: parseAgentOutput(fragmentTitleOutput),              // User-friendly title
              files: result.state.data.files,                           // Generated files
            },
          },
        },
      });
    });

    // Return results for debugging/monitoring
    return {
      url: sandboxUrl,                    // Live preview URL
      title: "Fragment",                  // Static title (overridden by database)
      files: result.state.data.files,     // Generated files
      summary: result.state.data.summary, // AI-generated summary
    };
  }
);
