import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";
import { SANDBOX_TIMEOUT } from "./types";

/**
 * Inngest Utility Functions
 * 
 * This module contains helper functions for working with E2B sandboxes
 * and processing AI agent outputs in the Inngest background functions.
 */

/**
 * Connect to an existing E2B sandbox by ID
 * 
 * Establishes connection to a previously created sandbox and sets the timeout.
 * Used to reconnect to sandboxes across different Inngest function steps.
 * 
 * @param sandboxId - The unique identifier of the sandbox to connect to
 * @returns Promise<Sandbox> - Connected sandbox instance
 * 
 * @example
 * const sandbox = await getSandbox("sandbox-123");
 * await sandbox.files.write("app.js", "console.log('Hello World')");
 */
export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(SANDBOX_TIMEOUT);
  return sandbox;
}

/**
 * Extract the last text message content from an AI agent result
 * 
 * Finds the most recent assistant message in the agent's output and
 * extracts its text content, handling both string and array formats.
 * 
 * @param result - The agent execution result containing message history
 * @returns string | undefined - The last assistant message content, or undefined if none found
 * 
 * @example
 * const lastMessage = lastAgentTextMessageContent(agentResult);
 * if (lastMessage?.includes("<task_summary>")) {
 *   // Process task summary
 * }
 */
export function lastAgentTextMessageContent(result: AgentResult) {
  // Find the last message from the assistant
  const lastAgentTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAgentTextMessageIndex] as
    | TextMessage
    | undefined;

  // Extract content, handling both string and array formats
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}

/**
 * Parse agent output message into a string
 * 
 * Converts the agent's message output into a clean string format,
 * handling different message types and content structures.
 * 
 * @param value - Array of messages from the agent
 * @returns string - Parsed content string, defaults to "Fragment" if parsing fails
 * 
 * @example
 * const responseText = parseAgentOutput(agentMessages);
 * await prisma.message.create({
 *   content: responseText,
 *   role: "ASSISTANT"
 * });
 */
export const parseAgentOutput = (value: Message[]) => {
  const output = value[0];

  // Only process text messages
  if (output.type !== "text") {
    return "Fragment";
  }

  // Handle both array and string content formats
  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("");
  } else {
    return output.content;
  }
};
