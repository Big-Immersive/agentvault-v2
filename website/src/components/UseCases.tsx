"use client";

import { Bot, Server, Rocket, Package, Brain, Plug } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const USE_CASES = [
  {
    icon: Bot,
    title: "AI Agent Sandboxing",
    desc: "Run Claude, Cursor, or any AI coding agent with scoped credentials. Agents only see what you allow.",
    command: 'agentvault wrap -p moderate "claude"',
    color: "text-primary",
    gradient: "from-primary/15 to-transparent",
  },
  {
    icon: Server,
    title: "Dev Servers",
    desc: "Start local dev servers with a controlled environment. No accidental credential leaks to hot-reloading processes.",
    command: 'agentvault wrap -p moderate "pnpm dev"',
    color: "text-trust-green",
    gradient: "from-trust-green/15 to-transparent",
  },
  {
    icon: Rocket,
    title: "CI/CD Pipelines",
    desc: "Build and deploy with only the variables the step needs. Each pipeline stage gets its own scoped profile.",
    command: 'agentvault wrap -p ci-deploy "npm run build"',
    color: "text-alert-amber",
    gradient: "from-alert-amber/15 to-transparent",
  },
  {
    icon: Package,
    title: "Third-Party Scripts",
    desc: "Run untrusted or third-party scripts without exposing your full environment. Audit everything they touch.",
    command: 'agentvault wrap -p restrictive "npx some-tool"',
    color: "text-accent-lavender",
    gradient: "from-accent-lavender/15 to-transparent",
  },
  {
    icon: Brain,
    title: "AI Memory Persistence",
    desc: "Store learned patterns, API behaviors, and project context across sessions. Agents query memories before re-discovering known solutions.",
    command: 'agentvault memory query "error handling patterns"',
    color: "text-accent-pink",
    gradient: "from-accent-pink/15 to-transparent",
  },
  {
    icon: Plug,
    title: "MCP Integration",
    desc: "Connect any MCP-compatible agent. Secrets and memories served as tool calls with built-in rate limiting and budget tracking.",
    command: "agentvault mcp start",
    color: "text-trust-green",
    gradient: "from-trust-green/15 to-transparent",
  },
];

export function UseCases() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-16 px-6" id="use-cases">
      <div className="section-line mb-12" />

      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            Use Cases
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            Sandbox{" "}
            <span className="gradient-text">anything.</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            AgentVault isn&apos;t just for AI agents. Wrap any process to control
            exactly which environment variables it can see.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-5 reveal-stagger`}>
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className={`card-glow p-7 reveal ${isVisible ? "visible" : ""}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${uc.gradient} flex items-center justify-center shrink-0 border border-[#1b0c25]/[0.06]`}
                  >
                    <Icon className={`w-5 h-5 ${uc.color}`} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-fg mb-1.5">
                      {uc.title}
                    </h3>
                    <p className="text-muted text-sm leading-relaxed">{uc.desc}</p>
                  </div>
                </div>
                <code
                  className={`font-[family-name:var(--font-mono)] text-xs ${uc.color} bg-[#1b0c25]/[0.04] px-3 py-2 rounded-lg border border-[#1b0c25]/[0.06] block`}
                >
                  $ {uc.command}
                </code>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
