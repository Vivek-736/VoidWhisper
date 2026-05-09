"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";

interface SpecPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  specId: string | null;
  projectId: string;
}

export function SpecPreviewModal({
  isOpen,
  onClose,
  specId,
  projectId,
}: SpecPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !specId) {
      setContent(null);
      return;
    }

    async function fetchSpec() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/specs/${specId}`);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        } else {
          setContent("Failed to load spec.");
        }
      } catch (err) {
        setContent("Failed to load spec.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpec();
  }, [isOpen, specId, projectId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden flex flex-col bg-bg-surface border-border-subtle p-0 sm:rounded-3xl">
        <DialogHeader className="px-6 py-4 border-b border-border-default shrink-0">
          <DialogTitle className="text-lg font-medium text-text-primary">
            Spec Preview
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-text-faint" />
            </div>
          ) : content ? (
            <div className="prose prose-sm dark:prose-invert prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-accent-primary max-w-none pb-8">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
