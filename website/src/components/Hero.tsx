"use client";

import { useEffect, useState } from "react";
import { Shield, ArrowRight } from "lucide-react";

const TERMINAL_LINES = [
  { text: "$ agentvault init", delay: 0, type: "command" },
  { text: "  Passphrase: ••••••••", delay: 800, type: "prompt" },
  { text: "  ✓ AgentVault initialized", delay: 1400, type: "success" },
  { text: "", delay: 1800, type: "empty" },
  { text: '$ agentvault secret add OPENAI_KEY "sk-..."', delay: 2200, type: "command" },
  { text: "  ✓ Secret encrypted and stored", delay: 3000, type: "success" },
  { text: "", delay: 3400, type: "empty" },
  { text: '$ agentvault memory store api-patterns \\', delay: 3800, type: "command" },
  { text: '    "Use retry with exponential backoff" --type knowledge', delay: 4200, type: "command" },
  { text: '  ✓ Memory stored (3 keywords)', delay: 4800, type: "success" },
  { text: "", delay: 5200, type: "empty" },
  { text: "$ agentvault mcp start", delay: 5600, type: "command" },
  { text: "  ⚡ MCP server listening (stdio)", delay: 6200, type: "info" },
  { text: "    11 tools · 60 req/min · encrypted", delay: 6600, type: "dim" },
];

const typeColors: Record<string, string> = {
  command: "text-[#e8eef3]",
  success: "text-trust-green",
  info: "text-primary",
  warning: "text-alert-amber",
  error: "text-danger-red",
  dim: "text-[#888]",
  prompt: "text-[#e8eef3]",
  empty: "",
};

export function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((_, i) =>
      setTimeout(() => setVisibleLines(i + 1), TERMINAL_LINES[i].delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="orb orb-1 top-[10%] left-[15%]" />
      <div className="orb orb-2 top-[30%] right-[10%]" />
      <div className="orb orb-3 bottom-[20%] left-[40%]" />

      {/* Content */}
      <div className="relative z-10 w-full px-3 py-32">
        {/* Glass card wrapping entire hero content */}
        <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-10 md:p-16 lg:p-20 shadow-[0_8px_40px_rgba(0,0,0,0.06)] max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#1b0c25]/10 bg-white/60 backdrop-blur-sm text-sm text-muted mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-trust-green animate-pulse" />
                Open Source · MIT License
              </div>

              {/* Heading */}
              <h1 className="font-[family-name:var(--font-heading)] text-5xl lg:text-7xl font-bold text-fg leading-[1.1] tracking-tight mb-8">
                Your secrets.
                <br />
                <span className="gradient-text">Your rules.</span>
              </h1>

              {/* Description */}
              <p className="text-lg lg:text-xl text-muted leading-relaxed mb-10 max-w-lg">
                AI agents have full access to your credentials and no persistent memory.
                AgentVault encrypts secrets, stores agent memories, and serves both via MCP.{" "}
                <span className="text-fg font-medium">One vault. Full control.</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <a href="#get-started" className="btn-primary inline-flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com/Big-Immersive/agentvault-v2"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Star on GitHub
                </a>
              </div>
            </div>

            {/* Right: Terminal */}
            <div className="terminal-glow rounded-2xl overflow-hidden bg-code-bg border border-[#1b0c25]/10">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.03]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger-red/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-alert-amber/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-trust-green/70" />
                </div>
                <span className="ml-3 text-xs text-[#666] font-[family-name:var(--font-mono)]">
                  ~/project
                </span>
              </div>

              {/* Terminal content */}
              <div className="p-5 font-[family-name:var(--font-mono)] text-[13px] leading-[1.8] min-h-[340px]">
                {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
                  <div
                    key={i}
                    className={`${typeColors[line.type]} ${line.type === "empty" ? "h-5" : ""}`}
                  >
                    {line.text}
                  </div>
                ))}
                <span className="inline-block w-2 h-[18px] bg-primary/70 animate-pulse rounded-sm mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
    </section>
  );
}
