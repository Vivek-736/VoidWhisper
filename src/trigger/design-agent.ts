import { task } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getLiveblocks } from "@/lib/liveblocks";
import type { AiStatusMessage } from "@/types/tasks";
import { NODE_SHAPES, SHAPE_DEFAULTS, NODE_COLORS } from "@/types/canvas";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export const designAgent = task({
  id: "design-agent",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { prompt: string; roomId: string; projectId: string }) => {
    const liveblocks = getLiveblocks();

    const updateStatus = async (status: AiStatusMessage["status"], text?: string, presence?: { x: number; y: number; thinking: boolean }) => {
      await liveblocks.mutateStorage(payload.roomId, (ctx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const root = ctx.root.get("aiStatus") as any;
        root.set("latest", {
          id: crypto.randomUUID(),
          text,
          status,
          timestamp: Date.now(),
        });
        if (presence) {
          root.set("aiPresence", presence);
        }
      });
    };

    try {
      await updateStatus("starting", "Analyzing prompt...", { x: 0, y: 0, thinking: true });

      const { object: designData } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
          nodes: z.array(z.object({
            id: z.string(),
            label: z.string(),
            shape: z.enum(NODE_SHAPES),
            x: z.number(),
            y: z.number(),
          })),
          edges: z.array(z.object({
            id: z.string(),
            source: z.string(),
            target: z.string(),
            label: z.string().optional(),
          })),
        }),
        prompt: `Create a system architecture diagram for the following prompt: "${payload.prompt}". Return an array of nodes and edges connecting them. Ensure reasonable coordinates for layout, spacing them roughly 200-300px apart horizontally and vertically.`,
      });

      await updateStatus("processing", "Generating nodes and edges...", { x: 100, y: 100, thinking: true });

      await liveblocks.mutateStorage(payload.roomId, (ctx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flow = ctx.root.get("flow") as any;
        const nodesMap = flow.get("nodes");
        const edgesMap = flow.get("edges");

        for (const node of designData.nodes) {
          const dims = SHAPE_DEFAULTS[node.shape];
          const colorKey = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
          nodesMap.set(node.id, {
            id: node.id,
            type: "canvasNode",
            position: { x: node.x, y: node.y },
            data: {
              label: node.label,
              shape: node.shape,
              color: colorKey.fill,
              textColor: colorKey.text,
            },
            width: dims.width,
            height: dims.height,
          });
        }

        for (const edge of designData.edges) {
          edgesMap.set(edge.id, {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: "canvasEdge",
            data: edge.label ? { label: edge.label } : {},
          });
        }
      });

      await updateStatus("complete", "Design generation complete.", { x: 0, y: 0, thinking: false });

      return {
        status: "success",
        designData,
      };
    } catch (error) {
      console.error(error);
      await updateStatus("error", "An error occurred during generation.", { x: 0, y: 0, thinking: false });
      throw error;
    }
  },
});