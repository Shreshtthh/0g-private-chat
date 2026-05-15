"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/chat-store";
import { useAccount, useWriteContract, useSwitchChain } from "wagmi";
import { PRIVATE_CHAT_ABI } from "@/lib/contract-abi";
import { Save, ExternalLink, Sparkles, Loader2, Check, Copy } from "lucide-react";
import { zgMainnet } from "@/lib/wagmi-config";


const CONTRACT = process.env.NEXT_PUBLIC_ZG_PRIVATE_CHAT_CONTRACT as `0x${string}`;

export function ChatHeader() {
  const { activeChat, activeChatId, updateChat } = useChatStore();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [savedMsgCount, setSavedMsgCount] = useState(0);
  const { switchChainAsync } = useSwitchChain();

  if (!activeChat) return null;

  const handleSaveTo0G = async () => {
    if (!activeChatId || !activeChat || saving) return;
    if (activeChat.messages.length === 0) return;

    setSaving(true);
    setSaveError(null);

    try {
      // Step 1: Upload encrypted chat to 0G Storage
      setStatus("Encrypting & uploading...");
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
      if (!res.ok) throw new Error(data.error || "Storage upload failed");

      let onChainTxHash = data.txHash;

      // Step 2: If wallet connected, record on-chain
      if (isConnected && address && CONTRACT) {
        await switchChainAsync({ chainId: zgMainnet.id });

        // Check if user is already registered (read-only, no gas)
        const { readContract } = await import("wagmi/actions");
        const { wagmiConfig } = await import("@/lib/wagmi-config");
        const isRegistered = await readContract(wagmiConfig, {
          address: CONTRACT,
          abi: PRIVATE_CHAT_ABI,
          functionName: "isRegistered",
          args: [address],
          chainId: zgMainnet.id,
        });

        if (!isRegistered) {
          setStatus("Registering user...");
          await writeContractAsync({
            address: CONTRACT,
            abi: PRIVATE_CHAT_ABI,
            functionName: "registerUser",
            chainId: zgMainnet.id,
          });
        }

        // Now save the chat on-chain
        try {
          setStatus("Recording on-chain...");
          onChainTxHash = await writeContractAsync({
            address: CONTRACT,
            abi: PRIVATE_CHAT_ABI,
            functionName: "saveChat",
            chainId: zgMainnet.id,
            args: [
              data.contentHash as `0x${string}`,
              data.rootHash as `0x${string}`,
              "qwen/qwen-2.5-7b-instruct",
            ],
          });
        } catch (contractErr: unknown) {
          console.warn("Contract call failed:", contractErr);
        }
      }


      updateChat(activeChatId, {
        merkleRoot: data.rootHash,
        txHash: onChainTxHash,
        savedTo0G: true,
      });

      setSavedMsgCount(activeChat.messages.length);

      setStatus("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setSaveError(msg);
      setStatus("");
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
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 cursor-pointer hover:bg-[var(--color-success)]/20 transition-all"
            onClick={() => { navigator.clipboard.writeText(activeChatId || ""); }}
            title={`Click to copy Chat ID: ${activeChatId}`}
          >
            <Check className="w-3 h-3" />Saved
            <Copy className="w-3 h-3 opacity-50" />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {saveError && (
          <span className="text-xs text-red-400 max-w-[200px] truncate">{saveError}</span>
        )}
        {status && (
          <span className="text-xs text-[var(--color-accent)] animate-pulse">{status}</span>
        )}
        <button
          onClick={handleSaveTo0G}
          disabled={saving || (activeChat.savedTo0G && activeChat.messages.length === savedMsgCount) || activeChat.messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title={activeChat.savedTo0G ? "Already saved" : "Save conversation to 0G Storage"}
        >
          {saving ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="hidden sm:inline">Saving...</span></>
          ) : (activeChat.savedTo0G && activeChat.messages.length === savedMsgCount) ? (
              <><Check className="w-3.5 h-3.5" /><span className="hidden sm:inline">Saved</span></>
          ) : (
            <><Save className="w-3.5 h-3.5" /><span className="hidden sm:inline">Save to 0G</span></>
          )}
        </button>
        {activeChat.txHash && (
          <a href={"https://chainscan.0g.ai/tx/" + activeChat.txHash} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent-glow)] transition-all">
            <ExternalLink className="w-3.5 h-3.5" /> Explorer
          </a>
        )}
      </div>
    </div>
  );
}

