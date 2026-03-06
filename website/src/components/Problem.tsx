"use client";

import { Unlock, EyeOff, Skull } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useScrollSpread } from "@/hooks/useScrollSpread";

const PROBLEMS = [
  {
    icon: Unlock,
    title: "Full Access by Default",
    desc: "Claude Code, Cursor, Codex — they inherit your entire shell environment. AWS keys, database URLs, API tokens. All of them.",
    accent: "from-danger-red/15 to-transparent",
    iconColor: "text-danger-red",
  },
  {
    icon: EyeOff,
    title: "Zero Visibility",
    desc: "No audit trail. No logs. You have no idea which credentials your agent accessed, what it did with them, or when.",
    accent: "from-alert-amber/15 to-transparent",
    iconColor: "text-alert-amber",
  },
  {
    icon: Skull,
    title: "Prompt Injection Risk",
    desc: "Dec 2025: 30+ vulnerabilities found across AI coding tools. Agents can be hijacked to exfiltrate your secrets silently.",
    accent: "from-accent-pink/20 to-transparent",
    iconColor: "text-accent-pink",
  },
];

export function Problem() {
  const { ref: headingRef, isVisible } = useInView();
  const { containerRef, setCardRef } = useScrollSpread();

  return (
    <section className="py-16 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            The Problem
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            Your AI agent can see{" "}
            <span className="text-primary">everything</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            AI coding agents run as processes on your machine with your full
            permissions. Every env var, every .env file, every AWS key — visible
            and accessible.
          </p>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-3 gap-6 overflow-visible">
          {PROBLEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                ref={setCardRef(i)}
                className="card-glow p-8 will-change-transform"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-5 border border-[#1b0c25]/[0.06]`}
                >
                  <Icon className={`w-5 h-5 ${item.iconColor}`} strokeWidth={2} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-3">
                  {item.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
