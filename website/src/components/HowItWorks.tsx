"use client";

import { Terminal, ShieldCheck, Brain, FileSearch } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { useScrollSpread } from "@/hooks/useScrollSpread";

const STEPS = [
  {
    step: "01",
    icon: Terminal,
    command: "agentvault init",
    title: "Initialize",
    desc: "One command creates your vault, encryption keys, and default permission profiles. Takes 2 seconds.",
    color: "text-primary",
    gradient: "from-primary/15 to-transparent",
  },
  {
    step: "02",
    icon: ShieldCheck,
    command: 'agentvault wrap -p moderate "agent"',
    title: "Wrap & Sandbox",
    desc: "Run any process — AI agents, dev servers, builds — inside a sandboxed environment. Credentials are filtered, redacted, or denied based on your profile.",
    color: "text-trust-green",
    gradient: "from-trust-green/15 to-transparent",
  },
  {
    step: "03",
    icon: Brain,
    command: 'agentvault memory query "auth flow"',
    title: "Remember & Learn",
    desc: "Agents store and query encrypted memories. Knowledge persists across sessions with keyword search, confidence scoring, and TTL.",
    color: "text-accent-lavender",
    gradient: "from-accent-lavender/15 to-transparent",
  },
  {
    step: "04",
    icon: FileSearch,
    command: "agentvault audit show",
    title: "Audit & Revoke",
    desc: "See every credential access attempt with timestamps, agent IDs, and results. Kill all sessions instantly.",
    color: "text-alert-amber",
    gradient: "from-alert-amber/15 to-transparent",
  },
];

export function HowItWorks() {
  const { ref: headingRef, isVisible } = useInView();
  const { containerRef, setCardRef } = useScrollSpread();

  return (
    <section className="py-16 px-6 relative" id="how-it-works">
      {/* Section divider */}
      <div className="section-line mb-12" />

      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            Four steps.{" "}
            <span className="gradient-text">Full control.</span>
          </h2>
        </div>

        <div ref={containerRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 overflow-visible">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                ref={setCardRef(i)}
                className="card-glow p-8 relative will-change-transform"
              >
                {/* Step number */}
                <span
                  className={`font-[family-name:var(--font-heading)] text-7xl font-bold ${s.color} opacity-[0.25] absolute top-4 right-6`}
                >
                  {s.step}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-5 border border-[#1b0c25]/[0.06]`}
                >
                  <Icon className={`w-5 h-5 ${s.color}`} strokeWidth={2} />
                </div>

                {/* Command */}
                <code
                  className={`font-[family-name:var(--font-mono)] text-xs ${s.color} bg-[#1b0c25]/[0.04] px-3 py-1.5 rounded-lg border border-[#1b0c25]/[0.06] inline-block mb-4`}
                >
                  {s.command}
                </code>

                <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-3">
                  {s.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
