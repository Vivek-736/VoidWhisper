"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Bot, X, Send, FileText, Download, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStorage, useMutation, useSelf } from "@liveblocks/react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import type { AiChatMessage, AiStatusMessage } from "@/types/tasks";
import { SpecPreviewModal } from "./spec-preview-modal";
import { formatDistanceToNow } from "date-fns";

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  roomId: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

export function AiSidebar({ isOpen, onClose, projectId, roomId }: AiSidebarProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [specRunId, setSpecRunId] = useState<string | null>(null);
  const [specPublicToken, setSpecPublicToken] = useState<string | null>(null);
  const [specs, setSpecs] = useState<any[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [previewSpecId, setPreviewSpecId] = useState<string | null>(null);

  const me = useSelf();
  const messages = useStorage((root) => root.aiChat) || [];
  const statusObject = useStorage((root) => root.aiStatus);
  const flow = useStorage((root) => root.flow); // get nodes/edges
  const latestStatus = statusObject?.latest as AiStatusMessage | undefined;

  const { run } = useRealtimeRun(runId ?? "", { 
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
  });
  const isRunning = runId !== null && run?.status !== "COMPLETED" && run?.status !== "FAILED" && run?.status !== "CANCELED";

  const { run: specRun } = useRealtimeRun(specRunId ?? "", { 
    accessToken: specPublicToken ?? undefined,
    enabled: !!specRunId && !!specPublicToken,
  });
  const isSpecRunning = specRunId !== null && specRun?.status !== "COMPLETED" && specRun?.status !== "FAILED" && specRun?.status !== "CANCELED";

  const fetchSpecs = useCallback(async () => {
    setIsLoadingSpecs(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (res.ok) {
        setSpecs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch specs", err);
    } finally {
      setIsLoadingSpecs(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchSpecs();
    }
  }, [isOpen, fetchSpecs]);

  useEffect(() => {
    if (runId && (run?.status === "COMPLETED" || run?.status === "FAILED" || run?.status === "CANCELED")) {
      setRunId(null);
      setPublicToken(null);
    }
  }, [run?.status, runId]);

  useEffect(() => {
    if (specRunId && (specRun?.status === "COMPLETED" || specRun?.status === "FAILED" || specRun?.status === "CANCELED")) {
      setSpecRunId(null);
      setSpecPublicToken(null);
      if (specRun?.status === "COMPLETED") {
        fetchSpecs(); // Refresh specs on completion
      }
    }
  }, [specRun?.status, specRunId, fetchSpecs]);

  const addMessage = useMutation(({ storage }, msg: Omit<AiChatMessage, "id" | "timestamp">) => {
    const aiChat = storage.get("aiChat");
    aiChat.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...msg,
    });
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isRunning) return;
    
    addMessage({
      role: "user",
      content: text,
      sender: me?.info?.name || "User",
    });

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId, projectId }),
      });
      const data = await res.json();
      if (data.runId) {
        setRunId(data.runId);
        
        const tokenRes = await fetch("/api/ai/design/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: data.runId }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.token) {
          setPublicToken(tokenData.token);
        }
      }
    } catch (err) {
      console.error(err);
      addMessage({
        role: "system",
        content: "Failed to trigger AI. Please try again.",
        sender: "System",
      });
    }
  }, [input, addMessage, isRunning, me, roomId, projectId]);

  const handleGenerateSpec = useCallback(async () => {
    if (isSpecRunning) return;

    try {
      const nodes = Array.from((flow as any)?.nodes?.values() || []);
      const edges = Array.from((flow as any)?.edges?.values() || []);
      
      const chatHistory = messages
        .map((m) => `${m.role === "user" ? "User" : "System"}: ${m.content}`)
        .join("\n");

      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes,
          edges,
        }),
      });
      const data = await res.json();

      if (data.runId) {
        setSpecRunId(data.runId);

        const tokenRes = await fetch("/api/ai/spec/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: data.runId }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.publicToken) {
          setSpecPublicToken(tokenData.publicToken);
        }
      }
    } catch (error) {
      console.error("Failed to generate spec:", error);
    }
  }, [isSpecRunning, flow, messages, roomId]);

  const handleDownload = useCallback(async (specId: string) => {
    window.open(`/api/projects/${projectId}/specs/${specId}/download`, "_blank");
  }, [projectId]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const ta = e.target;
      ta.style.height = "72px";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleChip = useCallback((chip: string) => {
    setInput(chip);
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      textareaRef.current.focus();
    }
  }, []);

  return (
    <aside
      className={cn(
        "fixed inset-y-3 right-3 top-15 z-40 hidden w-84 flex-col rounded-3xl border border-border-subtle bg-bg-surface/95 backdrop-blur-xl transition-transform duration-200 md:flex",
        isOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
      )}
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-border-default px-5 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-ai/15">
          <Bot className="h-4 w-4 text-accent-ai-text" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">AI Workspace</p>
          <p className="text-xs text-text-muted">Collaborate with Ghost AI</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-subtle hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-3 h-auto shrink-0 grid-cols-2 rounded-xl bg-bg-subtle p-1">
          <TabsTrigger
            value="architect"
            className="rounded-lg px-3 py-1.5 text-xs font-medium data-active:bg-accent-ai data-active:text-white data-active:shadow-none"
          >
            AI Architect
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-lg px-3 py-1.5 text-xs font-medium data-active:bg-accent-ai data-active:text-white data-active:shadow-none"
          >
            Specs
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="architect"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <div className="flex h-full flex-col">
            <ScrollArea className="flex-1">
              <div className="px-4 pt-3 pb-2">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-5 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-ai/15">
                      <Bot className="h-6 w-6 text-accent-ai-text" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        Ghost AI Architect
                      </p>
                      <p className="mt-1 text-xs leading-5 text-text-muted">
                        Describe your system and I&apos;ll help you design the
                        architecture.
                      </p>
                    </div>
                    <div className="flex w-full flex-col gap-2">
                      {STARTER_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleChip(chip)}
                          className="w-full rounded-full bg-bg-subtle px-4 py-2 text-left text-xs text-accent-ai-text transition-colors hover:bg-border-default"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pb-2">
                    {messages.map((msg) =>
                      msg.role === "user" ? (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[85%] rounded-2xl rounded-br-sm border-2 border-accent-primary/50 bg-accent-primary-dim px-4 py-2.5 text-sm text-text-primary">
                            {msg.content}
                          </div>
                        </div>
                      ) : (
                        <div key={msg.id} className="flex justify-start">
                          <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border-subtle bg-bg-elevated px-4 py-2.5 text-sm text-accent-ai-text">
                            {msg.content}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border-default p-3">
              {isRunning && latestStatus?.text && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-bg-subtle px-3 py-1.5 text-xs text-accent-ai-text">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="truncate">{latestStatus.text}</span>
                </div>
              )}
              <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-bg-elevated p-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  disabled={isRunning}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your system…"
                  style={{ height: "72px", maxHeight: "160px" }}
                  className="resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm text-text-primary shadow-none placeholder:text-text-faint focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-faint">
                    Shift+Enter for newline
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim() || isRunning}
                    className="h-7 gap-1.5 rounded-lg bg-accent-ai px-3 text-xs text-white hover:bg-accent-ai/80 disabled:opacity-40 w-20"
                  >
                    {isRunning ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : <><Send className="h-3 w-3" />Send</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full flex-col gap-4 p-4">
            <Button 
              onClick={handleGenerateSpec}
              disabled={isSpecRunning}
              className="w-full rounded-xl bg-accent-ai text-white hover:bg-accent-ai/80 disabled:opacity-50"
            >
              {isSpecRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Spec"
              )}
            </Button>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-3">
                {isLoadingSpecs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-text-faint" />
                  </div>
                ) : specs.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <FileText className="h-8 w-8 text-text-faint" />
                    <p className="text-sm text-text-muted">No specs generated yet</p>
                  </div>
                ) : (
                  specs.map((spec) => (
                    <div 
                      key={spec.id} 
                      className="group relative rounded-2xl border border-border-subtle bg-bg-elevated p-4 transition-colors hover:border-accent-ai/30"
                    >
                      <div 
                        className="flex cursor-pointer items-start gap-3"
                        onClick={() => setPreviewSpecId(spec.id)}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bg-subtle group-hover:bg-accent-ai/10">
                          <FileText className="h-4 w-4 text-text-muted group-hover:text-accent-ai-text" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            Spec {spec.id.slice(-6)}
                          </p>
                          <p className="mt-1 text-[10px] text-text-faint">
                            {formatDistanceToNow(new Date(spec.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(spec.id);
                          }}
                          className="h-7 gap-1.5 rounded-lg border-border-subtle px-3 text-xs text-text-muted hover:bg-bg-subtle hover:text-text-primary"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <SpecPreviewModal
        isOpen={!!previewSpecId}
        onClose={() => setPreviewSpecId(null)}
        specId={previewSpecId}
        projectId={projectId}
      />
    </aside>
  );
}