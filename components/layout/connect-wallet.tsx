"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, LogOut, ExternalLink } from "lucide-react";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`https://chainscan.0g.ai/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] glass transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-[var(--color-success)]" />
          {address.slice(0, 6)}...{address.slice(-4)}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </a>
        <button
          onClick={() => disconnect()}
          className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all cursor-pointer"
          title="Disconnect"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      style={{ background: "linear-gradient(135deg, #6c5ce7, #a29bfe)" }}
    >
      <Wallet className="w-4 h-4" />
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
