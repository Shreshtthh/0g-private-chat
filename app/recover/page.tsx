"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { wagmiConfig, zgMainnet } from "@/lib/wagmi-config";
import { PRIVATE_CHAT_ABI } from "@/lib/contract-abi";
import { ConnectWallet } from "@/components/layout/connect-wallet";
import { useRouter } from "next/navigation";
import {
  Shield,
  Download,
  Loader2,
  ArrowLeft,
  Lock,
  Clock,
  Cpu,
  Hash,
  MessageSquare,
  User,
} from "lucide-react";

const CONTRACT = process.env.NEXT_PUBLIC_ZG_PRIVATE_CHAT_CONTRACT as `0x${string}`;

interface ChatRecord {
  contentHash: string;
  merkleRoot: string;
  timestamp: bigint;
  model: string;
}

interface DecryptedChat {
  chatId: string;
  title: string;
  messages: { role: string; content: string }[];
  savedAt: string;
  app: string;
}

export default function RecoverPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [records, setRecords] = useState<ChatRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [decrypting, setDecrypting] = useState<number | null>(null);
  const [decryptedChat, setDecryptedChat] = useState<DecryptedChat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  // Manual chatId input for recovery
  const [manualChatId, setManualChatId] = useState("");
  const [manualRoot, setManualRoot] = useState("");

  // Load saved chats from localStorage
  interface SavedChat { id: string; title: string; merkleRoot?: string; savedTo0G?: boolean; }
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("0g-private-chat-store");
      if (raw) {
        const all = JSON.parse(raw);
        setSavedChats(all.filter((c: SavedChat) => c.savedTo0G && c.merkleRoot));
      }
    } catch {}
  }, []);

  const fetchRecords = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const count = await readContract(wagmiConfig, {
        address: CONTRACT,
        abi: PRIVATE_CHAT_ABI,
        functionName: "getUserChatCount",
        args: [address],
        chainId: zgMainnet.id,
      });

      const results: ChatRecord[] = [];
      for (let i = 0; i < Number(count); i++) {
        const record = await readContract(wagmiConfig, {
          address: CONTRACT,
          abi: PRIVATE_CHAT_ABI,
          functionName: "getUserChat",
          args: [address, BigInt(i)],
          chainId: zgMainnet.id,
        });
        results.push(record as unknown as ChatRecord);
      }
      setRecords(results);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const decryptChat = async (merkleRoot: string, chatId: string) => {
    setError(null);
    try {
      const res = await fetch("/api/storage/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rootHash: merkleRoot, chatId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Decryption failed");
      setDecryptedChat(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Decryption failed");
    }
  };

  const handleDecryptRecord = async (index: number) => {
    setDecrypting(index);
    const record = records[index];
    // We need the chatId to derive the encryption key
    // Prompt user for it since it's not stored on-chain
    const chatId = prompt("Enter the Chat ID for this conversation:\n(Found in your browser's local storage or from when you saved it)");
    if (!chatId) { setDecrypting(null); return; }
    await decryptChat(record.merkleRoot, chatId);
    setDecrypting(null);
  };

  const handleManualRecover = async () => {
    if (!manualChatId || !manualRoot) return;
    setDecrypting(-1);
    await decryptChat(manualRoot, manualChatId);
    setDecrypting(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 blur-[120px]" style={{ background: "radial-gradient(circle, #00d2a0, transparent)" }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ background: "radial-gradient(circle, #6c5ce7, transparent)" }} />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.push("/chat")} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Chat
          </button>
          <ConnectWallet />
        </div>

        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm text-[var(--color-text-secondary)]">
            <Shield className="w-4 h-4 text-[var(--color-success)]" />
            <span>Recover from 0G Storage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Recover Your <span className="gradient-text">Conversations</span>
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
            Your chats are encrypted on the 0G decentralized network. Connect your wallet to find your on-chain records, then decrypt and view them.
          </p>
        </div>

        {/* Decrypted Chat View */}
        {decryptedChat && (
          <div className="glass rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Lock className="w-4 h-4 text-[var(--color-success)]" />
                {decryptedChat.title}
              </h2>
              <button onClick={() => setDecryptedChat(null)} className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer">Close</button>
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mb-4">
              Saved: {new Date(decryptedChat.savedAt).toLocaleString()} | Chat ID: {decryptedChat.chatId}
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {decryptedChat.messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-[var(--color-user-bubble)] text-white"
                      : "bg-[var(--color-ai-bubble)] border border-[var(--color-border)]"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1 text-xs opacity-60">
                      {msg.role === "user" ? <User className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                      {msg.role === "user" ? "You" : "AI"}
                    </div>
                    <div className="chat-content whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* On-chain Records */}
        {mounted && isConnected && (
          <div className="glass rounded-xl p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Hash className="w-4 h-4 text-[var(--color-accent)]" />
                On-Chain Records
              </h2>
              <button
                onClick={fetchRecords}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #6c5ce7, #a29bfe)" }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {loading ? "Loading..." : "Fetch My Records"}
              </button>
            </div>

            {fetched && records.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No saved chats found for this wallet.</p>
            )}

            {records.length > 0 && (
              <div className="space-y-3">
                {records.map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <Clock className="w-3 h-3" />
                        {new Date(Number(record.timestamp) * 1000).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                        <Cpu className="w-3 h-3" />
                        {record.model}
                      </div>
                      <div className="text-xs font-mono text-[var(--color-text-muted)] truncate">
                        Root: {record.merkleRoot}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDecryptRecord(i)}
                      disabled={decrypting === i}
                      className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-success)] border border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {decrypting === i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                      Decrypt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Chats from Local Storage */}
        {savedChats.length > 0 && (
          <div className="glass rounded-xl p-6 mb-6 animate-fade-in">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--color-success)]" />
              Your Saved Chats
            </h2>
            <div className="space-y-3">
              {savedChats.map((chat, i) => (
                <div key={chat.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium">{chat.title}</p>
                    <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">ID: {chat.id}</p>
                    <p className="text-xs font-mono text-[var(--color-text-muted)] truncate">Root: {chat.merkleRoot}</p>
                  </div>
                  <button
                    onClick={async () => { setDecrypting(100 + i); await decryptChat(chat.merkleRoot!, chat.id); setDecrypting(null); }}
                    disabled={decrypting === 100 + i}
                    className="ml-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-success)] border border-[var(--color-success)]/30 hover:bg-[var(--color-success)]/10 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {decrypting === 100 + i ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                    Decrypt
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Recovery */}
        <div className="glass rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--color-warning)]" />
            Manual Recovery
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            If you have the Chat ID and Merkle Root from a previous save, enter them to decrypt directly.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Chat ID (e.g. chat_1778791199762_twgf1b)"
              value={manualChatId}
              onChange={(e) => setManualChatId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Merkle Root (0x...)"
              value={manualRoot}
              onChange={(e) => setManualRoot(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-sm focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
            <button
              onClick={handleManualRecover}
              disabled={!manualChatId || !manualRoot || decrypting === -1}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #00d2a0, #00b894)" }}
            >
              {decrypting === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {decrypting === -1 ? "Decrypting..." : "Decrypt from 0G Storage"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
