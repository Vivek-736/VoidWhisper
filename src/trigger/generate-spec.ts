import { task } from "@trigger.dev/sdk/v3";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: {
    projectId: string;
    roomId: string;
    chatHistory: string;
    nodes: any[];
    edges: any[];
  }) => {
    try {
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `You are a technical architect. Generate a comprehensive Markdown technical specification based on the following canvas elements and chat history.

Canvas Nodes:
${JSON.stringify(payload.nodes, null, 2)}

Canvas Edges:
${JSON.stringify(payload.edges, null, 2)}

Chat History:
${payload.chatHistory}

Please format the response nicely with headings, bullet points, and code blocks if appropriate.
`,
      });

      const fileName = `specs/${payload.projectId}-${Date.now()}.md`;
      const blob = await put(fileName, text, {
        access: "public",
        contentType: "text/markdown",
      });

      await prisma.projectSpec.create({
        data: {
          projectId: payload.projectId,
          filePath: blob.url,
        },
      });

      return { markdown: text };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
});
