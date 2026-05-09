import { z } from "zod";

export const AiStatusMessageSchema = z.object({
  id: z.string(),
  text: z.string().optional(),
  status: z.enum(["starting", "processing", "complete", "error"]),
  timestamp: z.number(),
});

export type AiStatusMessage = z.infer<typeof AiStatusMessageSchema>;

export const AiChatMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  role: z.enum(["user", "ai", "system"]),
  content: z.string(),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>;
