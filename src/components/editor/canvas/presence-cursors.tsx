"use client"

import { useRef } from "react"
import { useReactFlow, useViewport } from "@xyflow/react"
import { useOthers, useStorage } from "@liveblocks/react"
import { Loader2 } from "lucide-react"

export function PresenceCursors() {
  const containerRef = useRef<HTMLDivElement>(null)
  const others = useOthers()
  const aiStatus = useStorage((root) => root.aiStatus as any as { 
    aiPresence?: { x: number; y: number; thinking: boolean } 
  })
  const { flowToScreenPosition } = useReactFlow()
  useViewport()

  const renderCursor = (x: number, y: number, color: string, name: string, thinking: boolean, id: string) => {
    if (!containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    const screen = flowToScreenPosition({ x, y })
    const screenX = screen.x - rect.left
    const screenY = screen.y - rect.top

    return (
      <div
        key={id}
        className="absolute z-50 transition-all duration-300 ease-in-out"
        style={{ left: screenX, top: screenY }}
      >
        <svg
          width="16"
          height="20"
          viewBox="0 0 16 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L14 8.5L8 10.5L5.5 17L1 1Z"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className="mt-0.5 rounded px-1.5 py-0.5 text-xs font-medium text-white flex items-center gap-1.5"
          style={{ background: color, whiteSpace: "nowrap" }}
        >
          {thinking && (
            <Loader2 className="h-3 w-3 animate-spin text-white" />
          )}
          {name}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* eslint-disable-next-line react-hooks/refs */}
      {others.map((other) => {
        const cursor = other.presence.cursor
        if (!cursor) return null
        return renderCursor(
          cursor.x,
          cursor.y,
          other.info?.color ?? "#888888",
          other.info?.name ?? "Anonymous",
          !!other.presence.thinking,
          other.connectionId.toString()
        )
      })}
      {aiStatus?.aiPresence?.thinking && renderCursor(
        aiStatus.aiPresence.x,
        aiStatus.aiPresence.y,
        "#62C073",
        "Ghost AI",
        true,
        "ai-cursor"
      )}
    </div>
  )
}