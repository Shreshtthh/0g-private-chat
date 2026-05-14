"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Chat } from "@/lib/types";

interface ChatStore {
  chats: Chat[];
  activeChatId: string | null;
  activeChat: Chat | undefined;
  createChat: () => string;
  deleteChat: (id: string) => void;
  setActiveChatId: (id: string | null) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
}

const ChatContext = createContext<ChatStore | null>(null);
const STORAGE_KEY = "0g-private-chat-store";

function generateId() {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadChats(): Chat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function persistChats(chats: Chat[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setChats(loadChats()); setLoaded(true); }, []);
  useEffect(() => { if (loaded) persistChats(chats); }, [chats, loaded]);

  const createChat = useCallback(() => {
    const id = generateId();
    const newChat: Chat = { id, title: "New Chat", messages: [], createdAt: Date.now(), updatedAt: Date.now() };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(id);
    return id;
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  }, [activeChatId]);

  const updateChat = useCallback((id: string, updates: Partial<Chat>) => {
    setChats((prev) => prev.map((c) => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c));
  }, []);

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <ChatContext.Provider value={{ chats, activeChatId, activeChat, createChat, deleteChat, setActiveChatId, updateChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatStore() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatStore must be used within ChatProvider");
  return ctx;
}
