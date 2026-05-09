import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { runId } = await req.json();
    if (!runId) {
      return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    }

    // Verify ownership
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun || taskRun.userId !== userId) {
      return NextResponse.json({ error: "Forbidden or not found" }, { status: 403 });
    }

    // Generate Trigger.dev public token scoped to this run
    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ token: publicToken });
  } catch (error) {
    console.error("AI design token error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
