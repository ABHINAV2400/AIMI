import { openai, createAgent } from "@inngest/agent-kit";

import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const codeAgent = createAgent({
        name: "code-agent",
        system: "You are an expert next.js developer. You write maintainable, readable, simple next.js and react code snippets",
        model: openai({ model: "gpt-4o" }),
      });

    const { output } = await codeAgent.run(`summarize the following text: ${event.data.value}`)

    return { output };
  }
);
