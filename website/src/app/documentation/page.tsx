"use client";

import { useState, useEffect, Fragment } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Terminal,
  Key,
  Shield,
  Box,
  Eye,
  FileSearch,
  Wrench,
  Activity,
  ChevronRight,
  Copy,
  Check,
  List,
  Brain,
  Plug,
  Store,
  Download,
} from "lucide-react";

/* ─── Section definitions ─── */
const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Terminal },
  { id: "secrets", label: "Secret Management", icon: Key },
  { id: "profiles", label: "Profile Management", icon: Shield },
  { id: "sandboxing", label: "Sandboxing", icon: Box },
  { id: "preview-compare", label: "Preview & Compare", icon: Eye },
  { id: "audit", label: "Audit & Monitoring", icon: FileSearch },
  { id: "security", label: "Security & Maintenance", icon: Wrench },
  { id: "sessions", label: "Session Management", icon: Activity },
  { id: "memory", label: "Memory System", icon: Brain },
  { id: "mcp", label: "MCP Server", icon: Plug },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "portable", label: "Portable Vault", icon: Download },
  { id: "quick-reference", label: "Quick Reference", icon: List },
];

/* ─── Reusable code block component ─── */
function CodeBlock({ children, title }: { children: string; title?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-glow rounded-2xl overflow-hidden my-5">
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1b0c25]/[0.06] bg-white/[0.03]">
          <span className="text-xs text-[#666] font-medium">{title}</span>
          <button
            onClick={copy}
            className="text-[#666] hover:text-fg transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-trust-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed font-[family-name:var(--font-mono)] text-[#e8eef3] bg-code-bg">
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

/* ─── Command doc block ─── */
function CommandDoc({
  name,
  description,
  syntax,
  options,
  example,
  output,
  note,
}: {
  name: string;
  description: string;
  syntax: string;
  options?: { flag: string; desc: string }[];
  example: string;
  output?: string;
  note?: string;
}) {
  return (
    <div className="card-glow p-6 lg:p-8 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <code className="font-[family-name:var(--font-mono)] text-primary text-sm font-medium bg-primary/[0.08] px-3 py-1.5 rounded-lg border border-primary/20">
          {name}
        </code>
      </div>
      <p className="text-fg text-sm mb-4">{description}</p>

      <div className="mb-4">
        <span className="text-xs text-muted uppercase tracking-wider font-medium">
          Syntax
        </span>
        <code className="block font-[family-name:var(--font-mono)] text-xs text-primary mt-1.5 bg-[#1b0c25]/[0.03] px-4 py-2.5 rounded-lg border border-[#1b0c25]/[0.06]">
          {syntax}
        </code>
      </div>

      {options && options.length > 0 && (
        <div className="mb-4">
          <span className="text-xs text-muted uppercase tracking-wider font-medium">
            Options
          </span>
          <div className="mt-1.5 space-y-1">
            {options.map((o) => (
              <div key={o.flag} className="flex gap-4 text-xs">
                <code className="font-[family-name:var(--font-mono)] text-accent-lavender shrink-0 min-w-[180px]">
                  {o.flag}
                </code>
                <span className="text-muted">{o.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <CodeBlock title="Example">{example + (output ? "\n\n# Output:\n" + output : "")}</CodeBlock>

      {note && (
        <div className="flex gap-2 mt-4 text-xs text-alert-amber/90 bg-alert-amber/[0.06] px-4 py-2.5 rounded-lg border border-alert-amber/15">
          <span className="font-medium shrink-0">Note:</span>
          <span>{note}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({
  id,
  icon: Icon,
  title,
  desc,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div id={id} className="scroll-mt-24 mb-8 pt-12 first:pt-0">
      <div className="section-line mb-10" />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-transparent flex items-center justify-center border border-[#1b0c25]/[0.06]">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-fg">
          {title}
        </h2>
      </div>
      <p className="text-muted text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary/80 uppercase tracking-widest mb-4">
              Documentation
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-6xl font-bold text-fg mb-6">
              Command{" "}
              <span className="gradient-text">Guide</span>
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Everything you need to know about using AgentVault. From
              installation to advanced configuration.
            </p>
          </div>

          {/* Mobile section nav */}
          <div className="lg:hidden mb-10 overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeSection === s.id
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-white/60 text-muted border border-[#1b0c25]/[0.06] hover:text-fg"
                  }`}
                >
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-10">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 shrink-0">
              <nav className="sticky top-24 space-y-1">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                      activeSection === s.id
                        ? "bg-primary/[0.1] text-fg border border-primary/20"
                        : "text-muted hover:text-fg hover:bg-[#1b0c25]/[0.04] border border-transparent"
                    }`}
                  >
                    <s.icon
                      className={`w-4 h-4 shrink-0 ${
                        activeSection === s.id
                          ? "text-primary"
                          : "text-muted group-hover:text-fg"
                      }`}
                      strokeWidth={2}
                    />
                    <span>{s.label}</span>
                    {activeSection === s.id && (
                      <ChevronRight className="w-3 h-3 text-primary ml-auto" />
                    )}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* ─── 1. Getting Started ─── */}
              <SectionHeading
                id="getting-started"
                icon={Terminal}
                title="Getting Started"
                desc="Install AgentVault and initialize it in your project. This creates the encrypted vault, default permission profiles, and directory structure."
              />

              <div className="card-glow p-6 lg:p-8 mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-4">
                  Installation
                </h3>
                <CodeBlock title="Install globally">{`npm install -g agentvault`}</CodeBlock>
                <p className="text-muted text-sm mt-4">
                  Or clone and link for development:
                </p>
                <CodeBlock title="Development setup">{`git clone https://github.com/Big-Immersive/agentvault-v2.git
cd agentvault
npm install
npm run build
npm link`}</CodeBlock>
              </div>

              <CommandDoc
                name="agentvault init"
                description="Initialize AgentVault in the current project directory. Creates the .agentvault/ directory with encryption keys, default profiles (restrictive, moderate, permissive), and a .gitignore to protect secrets."
                syntax="agentvault init [options]"
                options={[
                  {
                    flag: "--skip-passphrase",
                    desc: "Skip passphrase prompt and use default",
                  },
                ]}
                example={`cd my-project
agentvault init`}
                output={`Vault Passphrase Setup
─────────────────────
Your secrets are encrypted with a passphrase.
You can set a custom one, or press Enter to use the default.

  Passphrase (Enter to skip): ********
  ✓ Custom passphrase saved

✓ AgentVault initialized
  Created: .agentvault/
  Profiles: restrictive, moderate, permissive`}
                note="The passphrase must be at least 8 characters. Press Enter to skip and use the default. For CI/scripts, use --skip-passphrase."
              />

              <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/[0.04] border border-primary/10 mb-6">
                <List className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-muted">
                  New to AgentVault?{" "}
                  <a href="#quick-reference" className="text-primary font-medium hover:underline">
                    See all commands at a glance &rarr;
                  </a>
                </p>
              </div>

              {/* ─── 2. Secret Management ─── */}
              <SectionHeading
                id="secrets"
                icon={Key}
                title="Secret Management"
                desc="Store, retrieve, and manage secrets in the encrypted vault. All secrets are encrypted with AES-256-GCM using a passphrase-derived key."
              />

              <CommandDoc
                name="secret add"
                description="Add a new secret to the vault or update an existing one. The value is encrypted immediately."
                syntax="agentvault secret add <key> <value>"
                example={`agentvault secret add AWS_SECRET_ACCESS_KEY "sk-abc123..."
agentvault secret add DATABASE_URL "postgres://user:pass@host/db"`}
                output={`✓ Secret "AWS_SECRET_ACCESS_KEY" stored`}
              />

              <CommandDoc
                name="secret get"
                description="Retrieve and decrypt a secret from the vault. Outputs the raw value to stdout."
                syntax="agentvault secret get <key>"
                example={`agentvault secret get AWS_SECRET_ACCESS_KEY`}
                output={`sk-abc123...`}
                note="The value is written to stdout so you can pipe it to other commands, e.g. agentvault secret get KEY | pbcopy"
              />

              <CommandDoc
                name="secret remove"
                description="Remove a secret from the vault permanently."
                syntax="agentvault secret remove <key>"
                example={`agentvault secret remove OLD_API_KEY`}
                output={`✓ Secret "OLD_API_KEY" removed`}
              />

              <CommandDoc
                name="secret rename"
                description="Rename a secret key without changing its value. Useful when migrating env var names."
                syntax="agentvault secret rename <oldKey> <newKey>"
                example={`agentvault secret rename API_KEY OPENAI_API_KEY`}
                output={`✓ Renamed "API_KEY" → "OPENAI_API_KEY"`}
              />

              <CommandDoc
                name="secret import"
                description="Import secrets from a .env file. Skips comments and blank lines, strips quotes from values. Existing keys are overwritten."
                syntax="agentvault secret import <file>"
                example={`# Given a .env file:
# DATABASE_URL="postgres://localhost/mydb"
# REDIS_URL=redis://localhost:6379
# # This is a comment

agentvault secret import .env`}
                output={`✓ Imported 2 secret(s) from .env`}
              />

              <CommandDoc
                name="secret list"
                description="List all secret keys stored in the vault. Values are never displayed."
                syntax="agentvault secret list"
                example={`agentvault secret list`}
                output={`  • AWS_SECRET_ACCESS_KEY
  • DATABASE_URL
  • OPENAI_API_KEY`}
              />

              {/* ─── 3. Profile Management ─── */}
              <SectionHeading
                id="profiles"
                icon={Shield}
                title="Profile Management"
                desc="Profiles define what environment variables an agent can see. Each profile has rules that allow, deny, or redact variables using glob patterns. Rules use last-match-wins semantics."
              />

              <div className="card-glow p-6 lg:p-8 mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-4">
                  Default Profiles
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-danger-red font-[family-name:var(--font-mono)] text-xs bg-danger-red/[0.08] px-2 py-1 rounded border border-danger-red/20 shrink-0">
                      restrictive
                    </span>
                    <span className="text-muted">
                      Denies everything except system vars. For untrusted or new agents. Trust level: 10.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-alert-amber font-[family-name:var(--font-mono)] text-xs bg-alert-amber/[0.08] px-2 py-1 rounded border border-alert-amber/20 shrink-0">
                      moderate
                    </span>
                    <span className="text-muted">
                      Allows common dev vars (NODE_ENV, PORT, DEBUG), redacts cloud credentials (AWS_*, OPENAI_*). Trust level: 50.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-[family-name:var(--font-mono)] text-xs bg-trust-green/[0.08] px-2 py-1 rounded border border-trust-green/20 shrink-0">
                      permissive
                    </span>
                    <span className="text-muted">
                      Full access with audit trail. Allows everything. For trusted agents. Trust level: 90.
                    </span>
                  </div>
                </div>
              </div>

              <CommandDoc
                name="profile list"
                description="List all available profiles with their trust levels and descriptions."
                syntax="agentvault profile list"
                example={`agentvault profile list`}
                output={`  restrictive (trust: 10, ttl: 300s) — Minimal access — denies everything except system vars.
  moderate (trust: 50, ttl: 3600s) — Balanced — allows common dev vars, redacts secrets.
  permissive (trust: 90, ttl: 86400s) — Full access with audit trail.`}
              />

              <CommandDoc
                name="profile show"
                description="Show detailed information about a profile including all its rules."
                syntax="agentvault profile show <name>"
                example={`agentvault profile show moderate`}
                output={`Profile: moderate
Description: Balanced — allows common dev vars, redacts secrets, denies cloud credentials.
Trust Level: 50
TTL: 3600s
Rules:
  * → deny
  NODE_ENV → allow
  NPM_* → allow
  DEBUG → allow
  LOG_LEVEL → allow
  PORT → allow
  HOST → allow
  DATABASE_URL → redact
  AWS_* → redact
  OPENAI_* → redact
  ANTHROPIC_* → redact`}
              />

              <CommandDoc
                name="profile create"
                description="Create a new custom profile with specific rules. Rules are specified as pattern:access pairs."
                syntax="agentvault profile create <name> [options]"
                options={[
                  {
                    flag: "-d, --description <desc>",
                    desc: "Profile description",
                  },
                  {
                    flag: "-t, --trust <level>",
                    desc: "Trust level 0-100 (default: 50)",
                  },
                  {
                    flag: "--ttl <seconds>",
                    desc: "Token TTL in seconds (default: 3600)",
                  },
                  {
                    flag: '-r, --rule <rules...>',
                    desc: 'Rules as "pattern:access" (allow/deny/redact)',
                  },
                ]}
                example={`agentvault profile create ci-deploy \\
  -d "CI/CD deployment profile" \\
  -t 70 --ttl 600 \\
  -r "*:deny" "NODE_ENV:allow" "AWS_*:redact" "DEPLOY_*:allow"`}
                output={`✓ Profile "ci-deploy" created`}
                note="Rules use last-match-wins semantics. Always start with *:deny then add specific allows."
              />

              <CommandDoc
                name="profile delete"
                description="Delete a profile permanently. Built-in profiles can be re-created by running init again."
                syntax="agentvault profile delete <name>"
                example={`agentvault profile delete ci-deploy`}
                output={`✓ Profile "ci-deploy" deleted`}
              />

              <CommandDoc
                name="profile clone"
                description="Clone an existing profile as a starting point for a new one. The clone gets all rules from the original."
                syntax="agentvault profile clone <from> <to>"
                example={`agentvault profile clone moderate my-custom`}
                output={`✓ Profile "moderate" cloned to "my-custom"`}
                note='After cloning, edit the YAML file directly at .agentvault/profiles/my-custom.yml to customize rules.'
              />

              {/* ─── 4. Sandboxing ─── */}
              <SectionHeading
                id="sandboxing"
                icon={Box}
                title="Sandboxing"
                desc="The core feature. Wrap any command to run it inside a sandboxed environment where credentials are filtered by your profile."
              />

              <CommandDoc
                name="agentvault wrap"
                description="Run a command inside a sandboxed environment. The child process only sees environment variables permitted by the chosen profile. Every access decision is logged to the audit trail."
                syntax='agentvault wrap -p <profile> [-a <agent-id>] "<command>"'
                options={[
                  {
                    flag: "-p, --profile <name>",
                    desc: "Permission profile to use (required)",
                  },
                  {
                    flag: "-a, --agent <id>",
                    desc: 'Agent identifier for audit trail (default: "default-agent")',
                  },
                ]}
                example={`# Run Claude Code with moderate permissions
agentvault wrap -p moderate "claude"

# Run a Python agent with restrictive profile
agentvault wrap -p restrictive -a "my-python-agent" "python agent.py"

# Run a dev server with sandboxed environment
agentvault wrap -p moderate "pnpm --dir ./my-app dev"

# Run a build with only the vars it needs
agentvault wrap -p ci-deploy "npm run build"`}
                output={`🔒 AgentVault wrapping: claude
   Profile: moderate (trust: 50)

[agent output appears here...]`}
                note="Works with any process, not just AI agents — dev servers, builds, deploys. The child sees VAULT_REDACTED_**** for redacted vars and doesn't see denied vars at all. System vars (PATH, HOME, SHELL) always pass through."
              />

              <div className="card-glow p-6 lg:p-8 mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-4">
                  How Sandboxing Works
                </h3>
                <div className="space-y-4 text-sm text-muted">
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-semibold shrink-0 w-6">1.</span>
                    <span>Loads the profile and gathers all env vars + vault secrets</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-semibold shrink-0 w-6">2.</span>
                    <span>Evaluates each variable against profile rules (last-match-wins)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-semibold shrink-0 w-6">3.</span>
                    <span>
                      <span className="text-trust-green">Allowed</span> vars pass through,{" "}
                      <span className="text-alert-amber">redacted</span> vars become VAULT_REDACTED_****,{" "}
                      <span className="text-danger-red">denied</span> vars are removed entirely
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-semibold shrink-0 w-6">4.</span>
                    <span>Every decision is logged to the audit trail with timestamps</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-trust-green font-semibold shrink-0 w-6">5.</span>
                    <span>Child process spawns with the filtered environment</span>
                  </div>
                </div>
              </div>

              {/* ─── 5. Preview & Compare ─── */}
              <SectionHeading
                id="preview-compare"
                icon={Eye}
                title="Preview & Compare"
                desc="Dry-run profiles to see what an agent would access, or compare two profiles side-by-side. No processes spawned, no audit logs written."
              />

              <CommandDoc
                name="agentvault preview"
                description="Preview what environment variables an agent would see with a given profile. Color-coded output shows allowed (green), redacted (yellow), and denied (red) variables."
                syntax="agentvault preview -p <profile> [options]"
                options={[
                  {
                    flag: "-p, --profile <name>",
                    desc: "Permission profile to use (required)",
                  },
                  { flag: "--allowed", desc: "Show only allowed variables" },
                  { flag: "--redacted", desc: "Show only redacted variables" },
                  { flag: "--denied", desc: "Show only denied variables" },
                ]}
                example={`agentvault preview -p moderate`}
                output={`Preview: profile "moderate" (trust: 50)

  ✓ allow   NODE_ENV=development
  ✓ allow   PORT=3000
  ✓ allow   DEBUG=true
  ✓ system  PATH=/usr/local/bin:/usr/bin
  ✓ system  HOME=/Users/you
  ~ redact  AWS_SECRET_ACCESS_KEY=VAULT_REDACTED_****
  ~ redact  OPENAI_API_KEY=VAULT_REDACTED_****
  ✗ deny    GITHUB_TOKEN
  ✗ deny    SLACK_WEBHOOK

Summary: 12 allowed, 3 redacted, 48 denied (63 total)`}
              />

              <CommandDoc
                name="agentvault diff"
                description="Compare two profiles to see where they differ. Shows a table of variables with different access decisions between the profiles."
                syntax="agentvault diff <profileA> <profileB>"
                example={`agentvault diff restrictive moderate`}
                output={`Diff: "restrictive" vs "moderate" (8 differences)

  VARIABLE                         restrictive moderate
  ────────────────────────────────  ────────── ──────────
  NODE_ENV                         deny       allow
  PORT                             deny       allow
  DEBUG                            deny       allow
  NPM_CONFIG_REGISTRY              deny       allow
  AWS_SECRET_ACCESS_KEY            deny       redact
  OPENAI_API_KEY                   deny       redact
  DATABASE_URL                     deny       redact
  HOST                             deny       allow

63 total vars, 8 differ`}
              />

              {/* ─── 6. Audit & Monitoring ─── */}
              <SectionHeading
                id="audit"
                icon={FileSearch}
                title="Audit & Monitoring"
                desc="Every credential access decision is logged to a SQLite database. Query logs, export them, or watch in real-time."
              />

              <CommandDoc
                name="audit show"
                description="Display audit log entries in a formatted table. Filter by session or agent ID."
                syntax="agentvault audit show [options]"
                options={[
                  {
                    flag: "-s, --session <id>",
                    desc: "Filter by session ID",
                  },
                  {
                    flag: "-a, --agent <id>",
                    desc: "Filter by agent ID",
                  },
                  {
                    flag: "-n, --limit <n>",
                    desc: "Number of entries to show (default: 50)",
                  },
                ]}
                example={`agentvault audit show -n 10`}
                output={`TIME                     SESSION    AGENT            PROFILE        VAR                          ACTION
-----------------------------------------------------------------------------------------------
2025-01-15 14:32:01.123  a1b2c3d4   claude-agent     moderate       NODE_ENV                     allow
2025-01-15 14:32:01.124  a1b2c3d4   claude-agent     moderate       AWS_SECRET_ACCESS_KEY         redact
2025-01-15 14:32:01.125  a1b2c3d4   claude-agent     moderate       GITHUB_TOKEN                  deny

3 entries`}
              />

              <CommandDoc
                name="audit export"
                description="Export the full audit log to a file. Supports JSON and CSV formats."
                syntax="agentvault audit export [options]"
                options={[
                  {
                    flag: "-o, --output <file>",
                    desc: "Output file path (prints to stdout if omitted)",
                  },
                  {
                    flag: "-f, --format <format>",
                    desc: "Output format: json or csv (default: json)",
                  },
                ]}
                example={`# Export as JSON
agentvault audit export -o audit-log.json

# Export as CSV
agentvault audit export -f csv -o audit-log.csv

# Pipe to another tool
agentvault audit export -f csv | grep "deny"`}
                output={`✓ Exported 142 entries to audit-log.json`}
              />

              <CommandDoc
                name="audit clear"
                description="Clear all audit log entries. This is irreversible."
                syntax="agentvault audit clear"
                example={`agentvault audit clear`}
                output={`✓ Audit log cleared`}
                note="Consider exporting the audit log before clearing it."
              />

              <CommandDoc
                name="agentvault watch"
                description="Live monitor that tails the audit log in real-time. Shows new entries as they appear when agents are running in other terminals."
                syntax="agentvault watch [options]"
                options={[
                  {
                    flag: "-i, --interval <ms>",
                    desc: "Poll interval in milliseconds (default: 1000)",
                  },
                ]}
                example={`# In terminal 1: start watching
agentvault watch

# In terminal 2: run an agent
agentvault wrap -p moderate "python agent.py"`}
                output={`Watching audit log... (Ctrl+C to stop)

TIME                     SESSION    AGENT            VAR                          ACTION
──────────────────────────────────────────────────────────────────────────────────────────
2025-01-15 14:35:12.001  e5f6a7b8   default-agent    NODE_ENV                     allow
2025-01-15 14:35:12.002  e5f6a7b8   default-agent    AWS_SECRET_KEY               redact
2025-01-15 14:35:12.003  e5f6a7b8   default-agent    SLACK_TOKEN                  deny`}
              />

              {/* ─── 7. Security & Maintenance ─── */}
              <SectionHeading
                id="security"
                icon={Wrench}
                title="Security & Maintenance"
                desc="Run health checks on your setup and rotate your vault encryption passphrase."
              />

              <CommandDoc
                name="agentvault doctor"
                description="Run a comprehensive health check on your AgentVault setup. Verifies the directory structure, .gitignore, profiles, vault encryption, passphrase, and audit database."
                syntax="agentvault doctor"
                example={`agentvault doctor`}
                output={`AgentVault Health Check

  ✓ AgentVault directory exists
  ✓ .gitignore present
  ✓ 3 profile(s) found
    ✓ restrictive — valid
    ✓ moderate — valid
    ✓ permissive — valid
  ✓ Vault readable (4 secret(s))
  ✓ Custom passphrase set
  ✓ Audit database exists

✓ All checks passed`}
              />

              <CommandDoc
                name="agentvault rotate"
                description="Rotate the vault encryption passphrase. Decrypts all secrets with the current passphrase and re-encrypts them with a new one."
                syntax="agentvault rotate"
                example={`agentvault rotate`}
                output={`Vault contains 4 secret(s) and 12 memory entries.
Enter a new passphrase to re-encrypt.

  New passphrase (min 8 chars): ********
  Confirm passphrase: ********

Passphrase rotated. Vault and memories re-encrypted.`}
                note="Both passphrases must match. The new passphrase must be at least 8 characters. Both vault.json and memory.json are re-encrypted."
              />

              {/* ─── 8. Session Management ─── */}
              <SectionHeading
                id="sessions"
                icon={Activity}
                title="Session Management"
                desc="Monitor active sandboxed sessions and revoke them instantly. Every wrap command creates a tracked session."
              />

              <CommandDoc
                name="agentvault status"
                description="Show the current AgentVault status including profile count, stored secrets, and active sessions."
                syntax="agentvault status"
                example={`agentvault status`}
                output={`🔐 AgentVault Status
   Profiles: 3 (restrictive, moderate, permissive)
   Secrets:  4 stored
   Sessions: 1 active

   • a1b2c3d4 | agent: claude-agent | profile: moderate | since: 2025-01-15T14:30:00Z`}
              />

              <CommandDoc
                name="agentvault revoke"
                description="Revoke agent sessions — the kill switch. Revoke a specific session by ID or all active sessions at once. Sends SIGTERM to the sandboxed process."
                syntax="agentvault revoke [options]"
                options={[
                  {
                    flag: "-s, --session <id>",
                    desc: "Revoke a specific session by ID",
                  },
                ]}
                example={`# Revoke all active sessions
agentvault revoke

# Revoke a specific session
agentvault revoke -s a1b2c3d4-e5f6-7890-abcd-ef1234567890`}
                output={`🛑 Revoked 1 active session(s)`}
                note="Use 'agentvault status' first to see active session IDs."
              />

              {/* ─── 9. Memory System ─── */}
              <SectionHeading
                id="memory"
                icon={Brain}
                title="Memory System"
                desc="Store, query, and manage agent knowledge across sessions. Encrypted with AES-256-GCM. Supports keyword search, confidence scoring, TTL expiry, and tag-based organization."
              />

              <CommandDoc
                name="memory store"
                description="Store a memory entry with optional type, tags, confidence score, and TTL. Keywords are auto-extracted for search."
                syntax="agentvault memory store <key> <content> [options]"
                options={[
                  { flag: "-t, --type <type>", desc: "Memory type: knowledge | query_cache | operational (default: knowledge)" },
                  { flag: "--tags <tags...>", desc: "Tags for categorization (space or comma-separated)" },
                  { flag: "-c, --confidence <n>", desc: "Confidence score 0-1 (default: 0.8)" },
                  { flag: "-s, --source <source>", desc: "Source identifier" },
                  { flag: "--ttl <seconds>", desc: "Time-to-live in seconds" },
                  { flag: "--overwrite", desc: "Suppress warning when overwriting existing key" },
                ]}
                example={`agentvault memory store "api-retry-pattern" \\
  "Use exponential backoff with jitter for API retries" \\
  --type knowledge --tags api,resilience --confidence 0.95`}
                output={`Memory "api-retry-pattern" stored (4 keywords)`}
              />

              <CommandDoc
                name="memory query"
                description="Search memories by keyword. Results are ranked by score = matchRatio × confidence × freshness × recencyBoost. Also searches purchased memory banks."
                syntax="agentvault memory query <query> [options]"
                options={[
                  { flag: "-n, --limit <n>", desc: "Max results (default: 10)" },
                  { flag: "--local-only", desc: "Search only local memories, skip purchased banks" },
                ]}
                example={`agentvault memory query "API retry error handling"`}
                output={`  [0.850] api-retry-pattern (knowledge) -- Use exponential backoff with jitter...
  [0.720] http-error-codes (knowledge) -- Common HTTP error codes and when to retry...

2 result(s) from 15 local entries`}
              />

              <CommandDoc
                name="memory list"
                description="List memory entries with optional filters by tag or type."
                syntax="agentvault memory list [options]"
                options={[
                  { flag: "--tag <tag>", desc: "Filter by tag" },
                  { flag: "-t, --type <type>", desc: "Filter by memory type" },
                  { flag: "-n, --limit <n>", desc: "Max entries (default: 100, use 0 for all)" },
                ]}
                example={`agentvault memory list --tag security`}
                output={`  owasp-top-10 (knowledge) [security, web] -- 1240 chars, accessed 5x
  tls-cert-rotation (operational) [security, devops] -- 890 chars, accessed 2x

2 entries total`}
              />

              <CommandDoc
                name="memory remove"
                description="Remove a memory entry by key."
                syntax="agentvault memory remove <key> [--dry-run]"
                options={[
                  { flag: "--dry-run", desc: "Preview without removing" },
                ]}
                example={`agentvault memory remove "old-pattern"`}
                output={`Memory "old-pattern" removed`}
              />

              <CommandDoc
                name="memory export"
                description="Export memories to JSON or encrypted .avault file. Supports filtering by tag and type."
                syntax="agentvault memory export [options]"
                options={[
                  { flag: "-o, --output <file>", desc: "Output file path" },
                  { flag: "--tag <tag>", desc: "Export only entries with this tag" },
                  { flag: "-t, --type <type>", desc: "Export only entries of this type" },
                  { flag: "--encrypt", desc: "Encrypt output as .avault file" },
                  { flag: "--passphrase <pass>", desc: "Passphrase for encrypted export" },
                ]}
                example={`# Export security rules as encrypted file
agentvault memory export --tag security --encrypt \\
  --passphrase share-pass -o security-rules.avault

# Export all as plain JSON
agentvault memory export -o all-memories.json`}
                output={`Exported 8 memories (encrypted) to security-rules.avault`}
              />

              <CommandDoc
                name="memory import"
                description="Import memories from JSON or encrypted .avault file. Auto-detects format. Supports merge, dry-run, and filtering."
                syntax="agentvault memory import <file> [options]"
                options={[
                  { flag: "--passphrase <pass>", desc: "Passphrase for encrypted .avault file" },
                  { flag: "--merge", desc: "Skip entries where key already exists" },
                  { flag: "--dry-run", desc: "Preview without importing" },
                  { flag: "--tag <tag>", desc: "Import only entries with this tag" },
                  { flag: "-t, --type <type>", desc: "Import only entries of this type" },
                ]}
                example={`# Import encrypted file
agentvault memory import security-rules.avault --passphrase share-pass

# Dry-run to preview
agentvault memory import memories.json --dry-run

# Import with merge (skip existing)
agentvault memory import knowledge.json --merge`}
                output={`Imported 8 memories from security-rules.avault`}
                note="Use --merge to skip keys that already exist. Without it, existing keys are overwritten."
              />

              {/* ─── 10. MCP Server ─── */}
              <SectionHeading
                id="mcp"
                icon={Plug}
                title="MCP Server"
                desc="Built-in Model Context Protocol server. Exposes 11 tools for secrets, memory, audit, and status via stdio or SSE transport. Rate-limited and budget-tracked."
              />

              <CommandDoc
                name="mcp start"
                description="Start the MCP server. Agents like Claude Code, Cursor, and others connect to this server to access vault tools."
                syntax="agentvault mcp start [options]"
                options={[
                  { flag: "--transport <type>", desc: "Transport: stdio (default) or sse" },
                  { flag: "--budget <amount>", desc: "Budget limit in USD" },
                  { flag: "--rate-limit <n>", desc: "Max calls per minute (default: 60)" },
                  { flag: "--profile <name>", desc: "Enforce a permission profile" },
                ]}
                example={`# Start MCP server (stdio transport)
agentvault mcp start

# Start with budget and rate limit
agentvault mcp start --budget 5.00 --rate-limit 30`}
                output={`MCP server listening (stdio)
11 tools registered`}
                note="Configure in .mcp.json for auto-start with Claude Code. The server injects a system prompt that teaches agents to query memory before answering."
              />

              <div className="card-glow p-6 lg:p-8 mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-4">
                  Available MCP Tools (11)
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["vault.secret.get", "Retrieve a secret by key"],
                    ["vault.secret.list", "List all secret keys"],
                    ["vault.memory.store", "Store a memory entry"],
                    ["vault.memory.query", "Search memories by keyword"],
                    ["vault.memory.list", "List memory entries"],
                    ["vault.memory.remove", "Remove a memory entry"],
                    ["vault.audit.show", "View audit log entries"],
                    ["vault.status", "Get vault status"],
                    ["vault.profile.show", "Show profile rules"],
                    ["vault.preview", "Preview env var access"],
                    ["vault.export", "Export to portable format"],
                  ].map(([tool, desc]) => (
                    <div key={tool} className="flex gap-4">
                      <code className="font-[family-name:var(--font-mono)] text-primary text-xs shrink-0 min-w-[200px]">{tool}</code>
                      <span className="text-muted text-xs">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── 11. Marketplace ─── */}
              <SectionHeading
                id="marketplace"
                icon={Store}
                title="Marketplace"
                desc="Package, publish, and sell memory banks. Buyers discover and purchase banks via a gateway server. License enforcement built in."
              />

              <CommandDoc
                name="memory package"
                description="Package filtered memories into a purchasable bank with encrypted content, descriptor metadata, and license configuration."
                syntax="agentvault memory package --from-tag <tag> --name <name> --price <price> [options]"
                options={[
                  { flag: "--from-tag <tag>", desc: "Filter memories by this tag" },
                  { flag: "--name <name>", desc: "Bank name" },
                  { flag: "--price <price>", desc: "Price identifier" },
                  { flag: "--description <desc>", desc: "Bank description" },
                  { flag: "--access-type <type>", desc: "unlimited | time_locked | access_limited | subscription" },
                  { flag: "--max-accesses <n>", desc: "Max queries for access_limited type" },
                  { flag: "--expires-days <n>", desc: "Expiry in days for time_locked type" },
                  { flag: "--dry-run", desc: "Preview without packaging" },
                ]}
                example={`agentvault memory package \\
  --from-tag security --name "owasp-rules" \\
  --price "10-usd" --access-type access_limited \\
  --max-accesses 100 --description "OWASP security patterns"`}
                output={`Packaged 12 memories into bank "owasp-rules"
  bank.encrypted: 4.2 KB
  descriptor.json: created
  license.json: access_limited (100 accesses)`}
              />

              <CommandDoc
                name="gateway start"
                description="Start the memory marketplace gateway server. Serves published banks and handles purchases."
                syntax="agentvault gateway start [options]"
                options={[
                  { flag: "--port <port>", desc: "Server port (default: 3200)" },
                  { flag: "--rpc <url>", desc: "Base Sepolia RPC endpoint" },
                ]}
                example={`agentvault gateway start --port 3200`}
                output={`Gateway server listening on port 3200`}
              />

              <CommandDoc
                name="publish"
                description="Publish a packaged bank to the gateway registry."
                syntax="agentvault publish <bank-name> [--dry-run]"
                example={`agentvault publish owasp-rules`}
                output={`Published bank "owasp-rules" to gateway`}
              />

              <CommandDoc
                name="discover"
                description="Search published memory banks on the gateway."
                syntax="agentvault discover <query> [--gateway <url>]"
                example={`agentvault discover "security patterns"`}
                output={`Found 3 banks:
  owasp-rules (12 entries) — OWASP security patterns — $10
  api-auth-flows (8 entries) — Authentication flow patterns — $5
  tls-best-practices (6 entries) — TLS configuration guide — $3`}
              />

              <CommandDoc
                name="checkout"
                description="Purchase a memory bank from the gateway. Verifies content hash and installs to purchased-banks/."
                syntax="agentvault checkout <bank-name> [--gateway <url>] [--dry-run]"
                example={`agentvault checkout owasp-rules`}
                output={`Purchased bank "owasp-rules" (12 entries)
  Installed to .agentvault/purchased-banks/owasp-rules/
  License: access_limited (100 accesses remaining)`}
              />

              {/* ─── 12. Portable Vault ─── */}
              <SectionHeading
                id="portable"
                icon={Download}
                title="Portable Vault"
                desc="Export and import the entire vault (secrets + memories) as an encrypted .avault file. Share between machines, teams, or agents."
              />

              <CommandDoc
                name="vault export"
                description="Export the vault to a portable .avault file encrypted with a separate passphrase."
                syntax="agentvault vault export <output> --passphrase <pass> [options]"
                options={[
                  { flag: "--passphrase <pass>", desc: "Passphrase for the exported file (required)" },
                  { flag: "--include-memories", desc: "Include memory entries (default: true)" },
                  { flag: "--decrypted", desc: "Export as plaintext JSON (requires --confirm-plaintext)" },
                  { flag: "--confirm-plaintext", desc: "Confirm plaintext export" },
                ]}
                example={`# Encrypted export
agentvault vault export backup.avault --passphrase share-pass

# Plaintext export (for debugging)
agentvault vault export backup.json --passphrase mypass \\
  --decrypted --confirm-plaintext`}
                output={`Exported vault to backup.avault`}
                note="The export passphrase is independent of your vault passphrase. The .avault file is self-contained and portable."
              />

              <CommandDoc
                name="vault import"
                description="Import from a portable .avault file. Supports merge mode and dry-run."
                syntax="agentvault vault import <input> --passphrase <pass> [options]"
                options={[
                  { flag: "--passphrase <pass>", desc: "Passphrase for the imported file (required)" },
                  { flag: "--merge", desc: "Skip existing keys instead of overwriting" },
                  { flag: "--dry-run", desc: "Preview without importing" },
                ]}
                example={`# Import with merge
agentvault vault import backup.avault --passphrase share-pass --merge

# Preview first
agentvault vault import backup.avault --passphrase share-pass --dry-run`}
                output={`Imported 4 secret(s) and 12 memory/memories from backup.avault
Skipped 2 existing secret(s)`}
              />

              {/* ─── 13. Quick Reference ─── */}
              <SectionHeading
                id="quick-reference"
                icon={List}
                title="Quick Reference"
                desc="All CLI commands at a glance. Click any command to jump to its full documentation."
              />

              <div className="card-glow p-6 lg:p-8 mb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#1b0c25]/[0.08]">
                      <th className="pb-2.5 text-muted font-medium text-xs uppercase tracking-wider">Command</th>
                      <th className="pb-2.5 text-muted font-medium text-xs uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { section: "Getting Started", anchor: "getting-started", commands: [
                        ["init", "Initialize AgentVault in a project — creates vault, profiles, and directory structure"],
                      ]},
                      { section: "Secret Management", anchor: "secrets", commands: [
                        ["secret add <key> <value>", "Store or update an encrypted secret in the vault"],
                        ["secret get <key>", "Retrieve and decrypt a secret, outputting the raw value"],
                        ["secret remove <key>", "Permanently delete a secret from the vault"],
                        ["secret rename <old> <new>", "Rename a secret key without changing its value"],
                        ["secret import <file>", "Bulk-import secrets from a .env file"],
                        ["secret list", "List all stored secret keys (values are never shown)"],
                      ]},
                      { section: "Profile Management", anchor: "profiles", commands: [
                        ["profile list", "List all profiles with trust levels and descriptions"],
                        ["profile show <name>", "Display a profile's rules, trust level, and TTL"],
                        ["profile create <name>", "Create a custom profile with pattern-based rules"],
                        ["profile delete <name>", "Permanently delete a profile"],
                        ["profile clone <from> <to>", "Duplicate an existing profile as a starting point"],
                      ]},
                      { section: "Sandboxing", anchor: "sandboxing", commands: [
                        ['wrap -p <profile> "cmd"', "Run a command in a sandboxed environment filtered by profile"],
                      ]},
                      { section: "Preview & Compare", anchor: "preview-compare", commands: [
                        ["preview -p <profile>", "Dry-run a profile to see what an agent would access"],
                        ["diff <profileA> <profileB>", "Compare two profiles side-by-side to see differences"],
                      ]},
                      { section: "Audit & Monitoring", anchor: "audit", commands: [
                        ["audit show", "Display audit log entries in a formatted table"],
                        ["audit export", "Export the full audit log to JSON or CSV"],
                        ["audit clear", "Clear all audit log entries irreversibly"],
                        ["watch", "Live-tail the audit log in real-time"],
                      ]},
                      { section: "Security & Maintenance", anchor: "security", commands: [
                        ["doctor", "Run a comprehensive health check on your setup"],
                        ["rotate", "Rotate the vault encryption passphrase"],
                      ]},
                      { section: "Session Management", anchor: "sessions", commands: [
                        ["status", "Show vault status, profile count, and active sessions"],
                        ["revoke", "Kill active sandboxed sessions immediately via SIGTERM"],
                      ]},
                      { section: "Memory System", anchor: "memory", commands: [
                        ["memory store <key> <content>", "Store an encrypted memory entry with tags, confidence, and TTL"],
                        ["memory query <query>", "Search memories by keyword (includes purchased banks)"],
                        ["memory list", "List memory entries with optional tag/type filters"],
                        ["memory remove <key>", "Remove a memory entry"],
                        ["memory export", "Export memories to JSON or encrypted .avault file"],
                        ["memory import <file>", "Import memories from JSON or encrypted .avault file"],
                      ]},
                      { section: "MCP Server", anchor: "mcp", commands: [
                        ["mcp start", "Start the MCP server (stdio or SSE transport)"],
                      ]},
                      { section: "Marketplace", anchor: "marketplace", commands: [
                        ["memory package", "Package memories into a purchasable bank"],
                        ["gateway start", "Start the marketplace gateway server"],
                        ["publish <bank>", "Publish a bank to the gateway"],
                        ["discover <query>", "Search published memory banks"],
                        ["checkout <bank>", "Purchase a memory bank from gateway"],
                      ]},
                      { section: "Portable Vault", anchor: "portable", commands: [
                        ["vault export <output>", "Export vault + memories to encrypted .avault file"],
                        ["vault import <input>", "Import from a portable .avault file"],
                      ]},
                    ].map((group) => (
                      <Fragment key={group.section}>
                        <tr>
                          <td colSpan={2} className="pt-4 pb-1.5">
                            <a href={`#${group.anchor}`} className="text-xs font-semibold text-fg/70 uppercase tracking-wider hover:text-primary transition-colors">
                              {group.section}
                            </a>
                          </td>
                        </tr>
                        {group.commands.map(([cmd, desc]) => (
                          <tr
                            key={cmd}
                            className="border-b border-[#1b0c25]/[0.04] hover:bg-primary/[0.03] transition-colors cursor-pointer group"
                            onClick={() => document.getElementById(group.anchor)?.scrollIntoView({ behavior: "smooth" })}
                          >
                            <td className="py-2 pr-6 font-[family-name:var(--font-mono)] text-primary text-xs whitespace-nowrap group-hover:text-primary/80">
                              {cmd}
                            </td>
                            <td className="py-2 text-muted text-xs group-hover:text-fg/70">
                              {desc}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
