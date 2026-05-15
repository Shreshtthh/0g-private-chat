"use client";

import { useChatStore } from "@/lib/chat-store";
import { Plus, MessageSquare, Trash2, Shield, X, Download } from "lucide-react";
import { ConnectWallet } from "./connect-wallet";

interface SidebarProps { onClose?: () => void; }

export function Sidebar({ onClose }: SidebarProps) {
  const { chats, activeChatId, createChat, deleteChat, setActiveChatId } = useChatStore();

  return (
    <div className="w-72 h-full flex flex-col bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)]">
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => window.location.href = "/"} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <Shield className="w-5 h-5 text-[var(--color-accent)]" />
          <span className="font-semibold text-sm gradient-text">0G Private Chat</span>
        </button>
        {onClose && (
          <button onClick={onClose} className="sm:hidden p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
            <X className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </button>
        )}
      </div>

      <div className="px-3 pb-3">
        <button onClick={() => { createChat(); onClose?.(); }} className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-200 cursor-pointer">
          <Plus className="w-4 h-4" /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {chats.length === 0 ? (
          <div className="text-center py-12 text-sm text-[var(--color-text-muted)]">No conversations yet.</div>
        ) : chats.map((chat) => (
          <div key={chat.id} onClick={() => { setActiveChatId(chat.id); onClose?.(); }}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${chat.id === activeChatId ? "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]" : "hover:bg-[var(--color-bg-hover)] border border-transparent"}`}>
            <MessageSquare className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{chat.title}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">{chat.messages.length} messages</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--color-border)] space-y-3">
        <button
          onClick={() => window.location.href = "/recover"}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Recover Conversations
        </button>
        <ConnectWallet />
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span>Decentralized · Encrypted · Private</span>
        </div>
      </div>

    </div>
  );
}
