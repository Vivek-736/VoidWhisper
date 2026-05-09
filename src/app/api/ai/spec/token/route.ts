import { NextResponse } from "next/server";
import { auth } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentProjectIdentity } from "@/lib/project-access";

const PayloadSchema = z.object({
  runId: z.string(),
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

    const { runId } = result.data;

    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    });

    if (!taskRun || taskRun.userId !== identity.userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    });

    return NextResponse.json({ publicToken });
  } catch (error) {
    console.error("[SPEC_TOKEN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}