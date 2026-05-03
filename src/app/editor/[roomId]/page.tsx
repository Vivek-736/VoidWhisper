import { redirect } from "next/navigation"
import { EditorWorkspaceClient } from "@/components/editor/editor-workspace-client"
import { AccessDenied } from "@/components/editor/access-denied"
import { getAccessibleProject, getCurrentProjectIdentity } from "@/lib/project-access"
import { getProjectsForUser } from "@/lib/projects"

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorWorkspacePage(props: PageProps) {
  const identity = await getCurrentProjectIdentity()
  
  if (!identity.userId) redirect("/sign-in")

  const { roomId } = await props.params
  const project = await getAccessibleProject(roomId, identity)

  if (!project) {
    return <AccessDenied />
  }

  const { owned, shared } = await getProjectsForUser(
    identity.userId,
    identity.primaryEmailAddress ?? ""
  )

  return (
    <EditorWorkspaceClient
      currentProject={{ id: project.id, name: project.name }}
      ownedProjects={owned.map((item) => ({ id: item.id, name: item.name }))}
      sharedProjects={shared.map((item) => ({ id: item.id, name: item.name }))}
      roomId={roomId}
    />
  )
}