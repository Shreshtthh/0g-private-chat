"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatContainer } from "@/components/chat/chat-container";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-bg-primary)]">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 sm:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className={`fixed sm:relative z-40 h-full transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="sm:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
            <Menu className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
          <span className="font-semibold text-sm gradient-text">0G Private Chat</span>
        </div>
        <ChatContainer />
      </div>
    </div>
  );
}
