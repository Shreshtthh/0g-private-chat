"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { Save, ExternalLink, Sparkles, Loader2, Check } from "lucide-react";

export function ChatHeader() {
  const { activeChat, activeChatId, updateChat } = useChatStore();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!activeChat) return null;

  const handleSaveTo0G = async () => {
    if (!activeChatId || !activeChat || saving) return;
    if (activeChat.messages.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch("/api/storage/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          title: activeChat.title,
          messages: activeChat.messages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }

      updateChat(activeChatId, {
        merkleRoot: data.rootHash,
        txHash: data.txHash,
        savedTo0G: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
        <h2 className="text-sm font-medium truncate">{activeChat.title}</h2>
        {activeChat.savedTo0G && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
            <Check className="w-3 h-3" />Saved to 0G
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {saveError && (
          <span className="text-xs text-red-400 max-w-[200px] truncate">{saveError}</span>
        )}
        <button
          onClick={handleSaveTo0G}
          disabled={saving || activeChat.savedTo0G || activeChat.messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title={activeChat.savedTo0G ? "Already saved" : "Save conversation to 0G Storage"}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Saving...</span></>
          ) : activeChat.savedTo0G ? (
            <><Check className="w-3.5 h-3.5" /><span className="hidden sm:inline">Saved</span></>
          ) : (
            <><Save className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save to 0G</span></>
          )}
        </button>
        {activeChat.txHash && (
          <a href={"https://chainscan-galileo.0g.ai/tx/" + activeChat.txHash} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Explorer
          </a>
        )}
      </div>
    </div>
  );
}
