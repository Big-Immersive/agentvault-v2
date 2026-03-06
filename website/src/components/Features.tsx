"use client";

import { Lock, Users, ClipboardList, AlertOctagon, BarChart3, Timer, Brain, Plug, Store } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const FEATURES = [
  {
    icon: Lock,
    title: "Encrypted Vault",
    desc: "AES-256-GCM encryption for all stored secrets. Master key derived from your passphrase with scrypt.",
    gradient: "from-primary/15 to-accent-coral/10",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Permission Profiles",
    desc: "Restrictive, moderate, permissive — or create custom profiles with granular per-credential rules.",
    gradient: "from-accent-lavender/20 to-transparent",
    iconColor: "text-accent-lavender",
    iconBg: "bg-accent-lavender/10",
  },
  {
    icon: ClipboardList,
    title: "Full Audit Trail",
    desc: "Every credential access logged with agent ID, timestamp, credential name, and allow/deny/redact result.",
    gradient: "from-trust-green/15 to-transparent",
    iconColor: "text-trust-green",
    iconBg: "bg-trust-green/10",
  },
  {
    icon: AlertOctagon,
    title: "Kill Switch",
    desc: "One command revokes all active agent sessions. Instantly cuts credential access across all running agents.",
    gradient: "from-danger-red/15 to-transparent",
    iconColor: "text-danger-red",
    iconBg: "bg-danger-red/10",
  },
  {
    icon: BarChart3,
    title: "Trust Levels",
    desc: "Score agents 1-100. Set minimum trust thresholds per credential. New agents start restricted.",
    gradient: "from-alert-amber/15 to-transparent",
    iconColor: "text-alert-amber",
    iconBg: "bg-alert-amber/10",
  },
  {
    icon: Timer,
    title: "TTL & Expiry",
    desc: "Time-limited sessions. Credentials auto-expire after your configured TTL. No stale access.",
    gradient: "from-accent-pink/15 to-transparent",
    iconColor: "text-accent-pink",
    iconBg: "bg-accent-pink/10",
  },
  {
    icon: Brain,
    title: "Agent Memory",
    desc: "Store knowledge, query caches, and operational data. Keyword search with confidence scoring, freshness decay, and TTL expiry.",
    gradient: "from-accent-lavender/20 to-transparent",
    iconColor: "text-accent-lavender",
    iconBg: "bg-accent-lavender/10",
  },
  {
    icon: Plug,
    title: "MCP Server",
    desc: "Built-in Model Context Protocol server. 11 tools for secrets, memory, audit, and status. Rate-limited and budget-tracked.",
    gradient: "from-trust-green/15 to-transparent",
    iconColor: "text-trust-green",
    iconBg: "bg-trust-green/10",
  },
  {
    icon: Store,
    title: "Memory Marketplace",
    desc: "Package, publish, and sell memory banks. License enforcement with time-locked, access-limited, and subscription models.",
    gradient: "from-primary/15 to-accent-coral/10",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
];

export function Features() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-16 px-6" id="features">
      <div className="section-line mb-12" />

      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            Built for{" "}
            <span className="gradient-text">security-conscious</span>{" "}
            developers
          </h2>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Everything you need to control AI agent credential access.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`card-glow p-8 flex flex-col items-center text-center reveal ${isVisible ? "visible" : ""}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 border border-white/60`}
                >
                  <Icon className={`w-6 h-6 ${f.iconColor}`} strokeWidth={1.8} />
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-3">
                  {f.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
