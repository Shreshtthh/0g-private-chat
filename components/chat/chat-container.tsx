"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useChatStore } from "@/lib/chat-store";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { EmptyState } from "./empty-state";

function getContent(m: any): string {
  if (typeof m.content === "string" && m.content) return m.content;
  if (m.parts && Array.isArray(m.parts)) {
    return m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text || "").join("");
  }
  if (typeof m.prompt === "string") return m.prompt;
  return "";
}

export function ChatContainer() {
  const { activeChat, activeChatId, createChat, updateChat } = useChatStore();
  const [localInput, setLocalInput] = useState("");
  const prevStatusRef = useRef<string>("");

  const { messages, status, setMessages, sendMessage, error } = useChat({});

  const isLoading = status === "submitted" || status === "streaming";

  /* Only sync to store when streaming FINISHES (status goes to "ready") */
  useEffect(() => {
    const wasLoading = prevStatusRef.current === "submitted" || prevStatusRef.current === "streaming";
    prevStatusRef.current = status;

    if (wasLoading && status === "ready" && activeChatId && messages.length > 0) {
      const firstUserMsg = messages.find((m) => m.role === "user");
      const title = getContent(firstUserMsg || messages[0])?.slice(0, 50) || "New Chat";
      updateChat(activeChatId, {
        title,
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content: getContent(m),
          createdAt: m.createdAt,
        })),
      });
    }
  }, [status]);

  /* Load messages when switching chats */
  useEffect(() => {
    if (activeChat && activeChat.messages.length > 0) {
      setMessages(
        activeChat.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const doSend = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;
      const trimmed = text.trim();
      if (!activeChatId) {
        createChat();
        // Wait a tick for the chat state to settle before sending
        setTimeout(() => {
          sendMessage({ prompt: trimmed });
        }, 50);
      } else {
        sendMessage({ prompt: trimmed });
      }
      setLocalInput("");
    },
    [activeChatId, createChat, sendMessage, isLoading]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      doSend(localInput);
    },
    [localInput, doSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalInput(e.target.value);
    },
    []
  );

  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {activeChatId && <ChatHeader />}
      {hasMessages ? (
        <MessageList messages={messages} isLoading={isLoading} />
      ) : (
        <EmptyState onNewChat={() => createChat()} onSend={doSend} />
      )}
      <ChatInput
        input={localInput}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
