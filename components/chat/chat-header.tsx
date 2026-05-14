"use client";

import { useChatStore } from "@/lib/chat-store";
import { Save, ExternalLink, Sparkles } from "lucide-react";

export function ChatHeader() {
  const { activeChat } = useChatStore();
  if (!activeChat) return null;

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
        <h2 className="text-sm font-medium truncate">{activeChat.title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-200 cursor-pointer">
          <Save className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save to 0G</span>
        </button>
      </div>
    </div>
  );
}
