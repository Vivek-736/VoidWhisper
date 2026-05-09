import type { LiveMap, LiveObject, LiveList } from "@liveblocks/client"
import type { LiveblocksNode, LiveblocksEdge } from "@liveblocks/react-flow"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"
import type { AiChatMessage, AiStatusMessage } from "@/types/tasks"

/* eslint-disable @typescript-eslint/no-empty-object-type */

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      thinking: boolean;
    };

    Storage: {
      flow: LiveObject<{
        nodes: LiveMap<string, LiveblocksNode<CanvasNode>>;
        edges: LiveMap<string, LiveblocksEdge<CanvasEdge>>;
      }>;
      aiChat: LiveList<AiChatMessage>;
      aiStatus: LiveObject<{ 
        latest?: AiStatusMessage;
        aiPresence?: { x: number; y: number; thinking: boolean };
      }>;
    };

    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };

    RoomEvent: {};

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export {};
