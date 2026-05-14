"use client";

import { Shield, Sparkles, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "Explain zero-knowledge proofs in simple terms",
  "What are Trusted Execution Environments?",
  "How does decentralized AI differ from centralized AI?",
  "Write a Solidity smart contract for a token",
];

export function EmptyState({ onNewChat, onSend }: { onNewChat: () => void; onSend: (msg: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg mx-auto text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-bold mb-3"><span className="gradient-text">Private AI Chat</span></h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10 max-w-sm mx-auto leading-relaxed">
          Your conversations run on decentralized infrastructure. Encrypted, verifiable, and owned by you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => onSend(s)} className="group flex items-center gap-2 px-4 py-3 rounded-xl text-left text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] glass hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)] opacity-50 group-hover:opacity-100" />
              <span className="flex-1 line-clamp-2">{s}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-50" />
            </button>
          ))}
        </div>
        <button onClick={onNewChat} className="text-sm text-[var(--color-accent)] hover:underline cursor-pointer">or start a blank conversation</button>
      </div>
    </div>
  );
}
