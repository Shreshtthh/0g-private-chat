"use client";

import { useRef, useEffect } from "react";
import { SendHorizonal, Loader2, AlertCircle } from "lucide-react";

interface ChatInputProps {
  input: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: Error | undefined;
}

export function ChatInput({ input = "", onChange, onSubmit, isLoading, error }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const value = input ?? "";

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [value]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) onChange(e);
  };

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2">
      {error && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-sm text-[var(--color-error)] animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error.message}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-end gap-2 glass-strong rounded-xl p-2 focus-within:border-[var(--color-accent)]/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none px-3 py-2.5 max-h-[200px] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: value.trim() && !isLoading
                ? "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)"
                : "var(--color-bg-hover)",
            }}
          >
            {isLoading
              ? <Loader2 className="w-4 h-4 text-[var(--color-text-secondary)] animate-spin" />
              : <SendHorizonal className="w-4 h-4 text-white" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-2">Messages processed via decentralized AI</p>
      </form>
    </div>
  );
}
