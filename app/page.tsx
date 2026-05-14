"use client";

import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, Cpu, Database, Link2, Server } from "lucide-react";

const FEATURES = [
  { icon: Cpu, title: "0G Compute", desc: "AI runs inside TEE hardware enclaves.", color: "#6c5ce7" },
  { icon: Database, title: "0G Storage", desc: "Encrypted conversations on decentralized storage.", color: "#00d2a0" },
  { icon: Link2, title: "0G Chain", desc: "On-chain proof of every interaction.", color: "#74b9ff" },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, #6c5ce7, transparent)" }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]" style={{ background: "radial-gradient(circle, #00d2a0, transparent)" }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-[var(--color-text-secondary)]">
          <Shield className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Powered by 0G Decentralized AI</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
          Your AI conversations,<br />
          <span className="gradient-text">truly private.</span>
        </h1>

        <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
          Chat with AI running inside hardware enclaves. Your messages are encrypted on decentralized storage.
        </p>

        <button onClick={() => router.push("/chat")}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] animate-pulse-glow cursor-pointer"
          style={{ background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)" }}>
          <Lock className="w-5 h-5" />
          Start Private Chat
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-20 px-4">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="glass rounded-xl p-6 hover:border-[var(--color-border-hover)] transition-all duration-300 animate-fade-in" style={{ animationDelay: `{i * 0.1 + 0.3}s`, animationFillMode: "backwards" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `{f.color}20` }}>
              <f.icon className="w-5 h-5" style={{ color: f.color }} />
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-16 mb-8 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <Server className="w-3.5 h-3.5" />
        <span>Decentralized AI by 0G Labs</span>
      </div>
    </div>
  );
}
