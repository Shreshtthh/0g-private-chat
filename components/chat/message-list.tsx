"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { MessageBubble } from "./message-bubble";
import { Bot } from "lucide-react";

export function MessageList({ messages, isLoading }: { messages: UIMessage[]; isLoading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message, i) => (
          <MessageBubble key={message.id} message={message} isLast={i === messages.length - 1} />
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div className="bg-[var(--color-ai-bubble)] border border-[var(--color-border)] rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] typing-dot" />
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted)] typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
