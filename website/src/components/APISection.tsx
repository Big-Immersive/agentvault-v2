"use client";

import { useInView } from "@/hooks/useInView";

const ENDPOINTS = [
  { method: "POST", path: "/v1/credentials/request", desc: "Request a credential with purpose + scope. Returns ALLOW, REDACT, or DENY.", color: "text-trust-green", bg: "bg-trust-green/10" },
  { method: "POST", path: "/v1/auth/register", desc: "Register an agent identity. New agents start at trust level 10.", color: "text-primary", bg: "bg-primary/10" },
  { method: "POST", path: "/v1/credentials/batch", desc: "Request multiple credentials at once. Ideal for agent startup.", color: "text-trust-green", bg: "bg-trust-green/10" },
  { method: "POST", path: "/v1/revoke", desc: "Emergency kill switch. Revoke ALL sessions across ALL agents.", color: "text-danger-red", bg: "bg-danger-red/10" },
  { method: "GET", path: "/v1/audit", desc: "Query audit events with filtering by agent, credential, decision, time.", color: "text-alert-amber", bg: "bg-alert-amber/10" },
  { method: "GET", path: "/v1/audit/stats", desc: "Aggregated statistics — requests, allow/deny/redact counts, anomalies.", color: "text-alert-amber", bg: "bg-alert-amber/10" },
];

const INTEGRATIONS = [
  { name: "LangChain", desc: "Callback handler gates all credential access" },
  { name: "CrewAI", desc: "SecureCrewAgent wraps any agent with vault gating" },
  { name: "AutoGen", desc: "VaultAssistantAgent for secure code execution" },
  { name: "OpenClaw", desc: "Middleware for all OpenClaw agent sessions" },
  { name: "MCP", desc: "Expose as MCP server — agents request creds as tools" },
  { name: "Cursor", desc: "Wrap Cursor sessions with credential scoping" },
];

const MODES = [
  { mode: "CLI Wrap", desc: "Zero-code. Wraps any agent process with credential filtering.", tag: "v0.1", color: "text-trust-green" },
  { mode: "SDK", desc: "Code-level. Agents call vault.get() for credentials.", tag: "v0.2", color: "text-primary" },
  { mode: "MCP Server", desc: "Agent-native. Agents request creds as MCP tool calls.", tag: "v0.2", color: "text-accent-lavender" },
  { mode: "Sidecar Proxy", desc: "Enterprise. Intercepts HTTP, injects auth headers transparently.", tag: "v0.4", color: "text-alert-amber" },
];

export function APISection() {
  const { ref, isVisible } = useInView();

  return (
    <section className="py-16 px-6" id="api">
      <div className="section-line mb-12" />

      <div className="max-w-6xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${isVisible ? "visible" : ""}`}>
          <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
            Platform
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-6">
            API-first.{" "}
            <span className="gradient-text-warm">SDK-native.</span>{" "}
            Platform-ready.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Beyond CLI wrapping — AgentVault is a credential gating platform.
            Agents request credentials through the API, get scoped tokens back.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className={`terminal-glow rounded-2xl p-6 mb-16 bg-code-bg border border-[#1b0c25]/10 overflow-x-auto reveal ${isVisible ? "visible" : ""}`}>
          <pre className="font-[family-name:var(--font-mono)] text-sm text-[#e8eef3] leading-relaxed whitespace-pre">{`┌─────────────────┐     ┌───────────────────┐     ┌──────────────┐
│    AI Agent      │────▶│   AgentVault API   │────▶│  Secret Store │
│ (Cursor, Claude  │     │   ┌─────────────┐  │     │  (local, 1pw, │
│  Code, LangChain,│◀────│   │  Policy      │  │◀────│   vault, aws) │
│  CrewAI, MCP)    │     │   │  Engine      │  │     └──────────────┘
└─────────────────┘     │   └─────────────┘  │
                         │   ┌─────────────┐  │
                         │   │  Audit Trail │  │
                         │   └─────────────┘  │
                         └───────────────────┘`}</pre>
        </div>

        {/* Two columns: Endpoints + SDK */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* REST API */}
          <div className={`reveal ${isVisible ? "visible" : ""}`}>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-5">
              REST API
            </h3>
            <div className="space-y-2.5">
              {ENDPOINTS.map((ep) => (
                <div
                  key={ep.path}
                  className="card-glow !rounded-xl p-4 hover:!transform-none"
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={`font-[family-name:var(--font-mono)] text-[10px] font-bold px-2 py-0.5 rounded ${ep.bg} ${ep.color}`}>
                      {ep.method}
                    </span>
                    <code className="font-[family-name:var(--font-mono)] text-xs text-fg">
                      {ep.path}
                    </code>
                  </div>
                  <p className="text-muted text-xs leading-relaxed">{ep.desc}</p>
                </div>
              ))}
              <a href="https://github.com/agentvault/agentvault/blob/main/docs/openapi.yaml" className="inline-block text-primary text-sm hover:text-primary-hover transition-colors mt-3">
                View full OpenAPI spec →
              </a>
            </div>
          </div>

          {/* SDK Example */}
          <div className={`reveal ${isVisible ? "visible" : ""}`} style={{ transitionDelay: "150ms" }}>
            <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-5">
              Python SDK
            </h3>
            <div className="terminal-glow rounded-2xl overflow-hidden bg-code-bg border border-[#1b0c25]/10">
              <div className="flex items-center px-5 py-3 border-b border-white/[0.08] bg-white/[0.03]">
                <span className="font-[family-name:var(--font-mono)] text-xs text-[#666]">
                  pip install agentvault
                </span>
              </div>
              <pre className="p-5 font-[family-name:var(--font-mono)] text-xs leading-[1.9] overflow-x-auto">
                <span className="syntax-keyword">from</span>{" "}
                <span className="syntax-variable">agentvault</span>{" "}
                <span className="syntax-keyword">import</span>{" "}
                <span className="syntax-variable">AgentVault</span>{"\n\n"}
                <span className="syntax-variable">vault</span>{" = "}
                <span className="syntax-function">AgentVault</span>{"("}
                <span className="syntax-variable">agent_name</span>{"="}
                <span className="syntax-string">&quot;researcher&quot;</span>{", "}
                <span className="syntax-variable">profile</span>{"="}
                <span className="syntax-string">&quot;moderate&quot;</span>{")"}{"\n\n"}
                <span className="syntax-comment"># Agent requests credentials with purpose</span>{"\n"}
                <span className="syntax-variable">api_key</span>{" = vault."}
                <span className="syntax-function">get</span>{"("}
                <span className="syntax-string">&quot;OPENAI_API_KEY&quot;</span>{", purpose="}
                <span className="syntax-string">&quot;embeddings&quot;</span>{")"}{"\n\n"}
                <span className="syntax-comment"># Context manager auto-releases</span>{"\n"}
                <span className="syntax-keyword">with</span>{" vault."}
                <span className="syntax-function">credential</span>{"("}
                <span className="syntax-string">&quot;DATABASE_URL&quot;</span>{", purpose="}
                <span className="syntax-string">&quot;read schema&quot;</span>{") "}
                <span className="syntax-keyword">as</span>{" db:"}{"\n"}
                {"    results = "}
                <span className="syntax-function">query</span>{"(db, "}
                <span className="syntax-string">&quot;SELECT * FROM users LIMIT 5&quot;</span>{")"}{"\n\n"}
                <span className="syntax-comment"># Check what you can access</span>{"\n"}
                <span className="syntax-variable">available</span>{" = vault."}
                <span className="syntax-function">list_available</span>{"()"}{"\n"}
                <span className="syntax-comment"># → [&quot;OPENAI_API_KEY&quot;, &quot;NODE_ENV&quot;, &quot;PORT&quot;]</span>
              </pre>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Python", "TypeScript", "Go", "Rust"].map((lang, i) => (
                <span
                  key={lang}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${
                    i === 0
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/60 text-muted border-[#1b0c25]/[0.06]"
                  }`}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className={`reveal ${isVisible ? "visible" : ""}`}>
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-2 text-center">
            Native framework integrations
          </h3>
          <p className="text-muted text-center mb-8 text-sm">
            Drop-in support for every major agent framework.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {INTEGRATIONS.map((item) => (
              <div key={item.name} className="card-glow !rounded-xl p-4 text-center hover:!transform-none">
                <div className="font-[family-name:var(--font-heading)] text-sm font-semibold text-fg mb-1">
                  {item.name}
                </div>
                <p className="text-muted text-[10px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration modes */}
        <div className={`mt-12 grid md:grid-cols-4 gap-4 reveal-stagger`}>
          {MODES.map((m) => (
            <div key={m.mode} className={`card-glow !rounded-xl p-5 reveal ${isVisible ? "visible" : ""}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-fg">
                  {m.mode}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${m.color} bg-[#1b0c25]/[0.04] border border-[#1b0c25]/[0.06]`}>
                  {m.tag}
                </span>
              </div>
              <p className="text-muted text-xs leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
