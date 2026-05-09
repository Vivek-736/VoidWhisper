import { NextResponse } from "next/server";
import { getCurrentProjectIdentity, userHasProjectAccess } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk/v3";
import { designAgent } from "../../../../trigger/design-agent";

export async function POST(req: Request) {
  try {
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, roomId, projectId } = body;

    if (!prompt || !roomId || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify access
    const hasAccess = await userHasProjectAccess(projectId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Trigger task
    const handle = await tasks.trigger<typeof designAgent>("design-agent", {
      prompt,
      roomId,
      projectId
    });

    // Create TaskRun record
    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId: identity.userId
      }
    });

    return NextResponse.json({ runId: handle.id });

  } catch (error) {
    console.error("AI design trigger error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}