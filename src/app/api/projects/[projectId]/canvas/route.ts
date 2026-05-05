import { get, put } from "@vercel/blob";
import {
  getCurrentProjectIdentity,
  userHasProjectAccess,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
) {
  const identity = await getCurrentProjectIdentity();
  if (!identity.userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const hasAccess = await userHasProjectAccess(projectId, identity);
  if (!hasAccess) return Response.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!project?.canvasJsonPath) return Response.json({ canvas: null });

  const result = await get(project.canvasJsonPath, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream)
    return Response.json({ canvas: null });

  const canvas: unknown = await new Response(result.stream).json();
  return Response.json({ canvas });
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]/canvas">,
) {
  const identity = await getCurrentProjectIdentity();
  if (!identity.userId)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await ctx.params;
  const hasAccess = await userHasProjectAccess(projectId, identity);
  if (!hasAccess) return Response.json({ error: "Not found" }, { status: 404 });

  const body: unknown = await request.json().catch(() => ({}));
  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  });

  return Response.json({ url: blob.url });
}