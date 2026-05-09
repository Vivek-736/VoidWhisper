import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getCurrentProjectIdentity,
  userHasProjectAccess,
} from "@/lib/project-access";

const PayloadSchema = z.object({
  roomId: z.string(),
  chatHistory: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const result = PayloadSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const { roomId, chatHistory, nodes, edges } = result.data;

    const projectId = roomId;

    const hasAccess = await userHasProjectAccess(projectId, identity);
    
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const handle = await tasks.trigger("generate-spec", {
      projectId,
      roomId,
      chatHistory,
      nodes,
      edges,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId: identity.userId,
      },
    });

    return NextResponse.json({ runId: handle.id });
  } catch (error) {
    console.error("[SPEC_TRIGGER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}