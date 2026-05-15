"use client";

import { User, Bot, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";

function getContent(message: any): string {
  if (typeof message.content === "string" && message.content) return message.content;
  if (message.parts && Array.isArray(message.parts)) {
    const text = message.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text || "")
      .join("");
    if (text) return text;
  }
  if (typeof message.prompt === "string") return message.prompt;
  return "";
}

export function MessageBubble({ message, isLast }: { message: any; isLast: boolean }) {
  const isUser = message.role === "user";
  const content = getContent(message);

  if (!content) return null;

  const wrapperClass = "flex gap-3 " + (isUser ? "justify-end" : "justify-start") + (isLast ? " animate-fade-in" : "");
  const bubbleClass = "rounded-2xl px-4 py-3 text-sm leading-relaxed " + (isUser ? "bg-[var(--color-user-bubble)] text-white rounded-br-md" : "bg-[var(--color-ai-bubble)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-bl-md");

  return (
    <div className={wrapperClass}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-4 h-4 text-[var(--color-accent)]" />
        </div>
      )}
      <div className="max-w-[80%] sm:max-w-[70%]">
        <div className={bubbleClass}>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <div className="chat-content break-words">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <ShieldCheck className="w-3 h-3 text-[var(--color-success)]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">TEE Verified · 0G Compute</span>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/30 flex items-center justify-center shrink-0 mt-1">
          <User className="w-4 h-4 text-[var(--color-accent)]" />
        </div>
      )}
    </div>
  );
}
