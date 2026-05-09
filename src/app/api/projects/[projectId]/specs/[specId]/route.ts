import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCurrentProjectIdentity,
  userHasProjectAccess,
} from "@/lib/project-access";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; specId: string }> }
) {
  try {
    const { projectId, specId } = await params;
    const identity = await getCurrentProjectIdentity();
    if (!identity.userId) return new NextResponse("Unauthorized", { status: 401 });

    const hasAccess = await userHasProjectAccess(projectId, identity);
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const spec = await prisma.projectSpec.findUnique({
      where: {
        id: specId,
      },
    });

    if (!spec || spec.projectId !== projectId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const response = await fetch(spec.filePath);
    if (!response.ok) {
      return new NextResponse("Failed to fetch spec content", { status: 500 });
    }
    const content = await response.text();

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error) {
    console.error("[SPEC_GET_ERROR]", error);
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}