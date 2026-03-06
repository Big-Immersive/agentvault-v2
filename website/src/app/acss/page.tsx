"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  BookOpen,
  Layers,
  Shield,
  Lock,
  FileText,
  Activity,
  FolderTree,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  Download,
} from "lucide-react";

/* ─── Section definitions ─── */
const SECTIONS = [
  { id: "introduction", label: "Introduction", icon: BookOpen },
  { id: "architecture", label: "Architecture", icon: Layers },
  { id: "profiles", label: "Permission Profiles", icon: Shield },
  { id: "access-model", label: "Access Decisions", icon: CheckCircle },
  { id: "vault", label: "Vault Encryption", icon: Lock },
  { id: "audit", label: "Audit Trail", icon: FileText },
  { id: "sessions", label: "Session Management", icon: Activity },
  { id: "directory", label: "Directory Structure", icon: FolderTree },
  { id: "security", label: "Security", icon: AlertTriangle },
  { id: "conformance", label: "Conformance", icon: CheckCircle },
];

/* ─── Reusable code block ─── */
function CodeBlock({ children, title, lang }: { children: string; title?: string; lang?: string }) {
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
          <span className="text-xs text-[#666] font-medium">{title}{lang && <span className="ml-2 text-[#555]">({lang})</span>}</span>
          <button onClick={copy} className="text-[#666] hover:text-fg transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-trust-green" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed font-[family-name:var(--font-mono)] text-[#f0ebe8] bg-code-bg">
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ id, icon: Icon, title, desc }: { id: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <div id={id} className="scroll-mt-24 mb-8 pt-12 first:pt-0">
      <div className="section-line mb-10" />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-transparent flex items-center justify-center border border-[#1b0c25]/[0.06]">
          <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-fg">{title}</h2>
      </div>
      <p className="text-muted text-sm leading-relaxed max-w-2xl">{desc}</p>
    </div>
  );
}

/* ─── Info box ─── */
function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 my-4 text-xs text-primary/90 bg-primary/[0.06] px-4 py-3 rounded-lg border border-primary/15">
      <span className="font-medium shrink-0">{label}:</span>
      <span className="text-fg/70">{children}</span>
    </div>
  );
}

/* ─── Table component ─── */
function SpecTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="card-glow !p-0 overflow-hidden my-5">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1b0c25]/[0.06]">
              {headers.map((h) => (
                <th key={h} className="text-left py-3 px-5 text-muted font-medium text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[#1b0c25]/[0.04] last:border-b-0">
                {row.map((cell, j) => (
                  <td key={j} className={`py-3 px-5 ${j === 0 ? "text-fg font-medium font-[family-name:var(--font-mono)] text-xs" : "text-muted"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function SpecPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="mb-6">
                <span className="text-xs font-medium text-primary uppercase tracking-widest">ACSS v1.0</span>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-fg mt-1">Specification</h3>
              </div>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted hover:text-fg hover:bg-[#1b0c25]/[0.03]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-[#1b0c25]/[0.06]">
                <a
                  href="https://github.com/agentvault/agentvault/tree/main/spec"
                  className="flex items-center gap-2 text-xs text-muted hover:text-fg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  View on GitHub
                </a>
              </div>
            </div>
          </aside>

          {/* Mobile nav */}
          <div className="lg:hidden mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                    activeSection === id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted hover:text-fg bg-[#1b0c25]/[0.03]"
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Content */}
          <main className="min-w-0">
            {/* Header */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/[0.06] text-xs text-primary font-medium mb-4">
                Draft Specification
              </div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-fg mb-4">
                Agent Credential Sandboxing Standard
              </h1>
              <p className="text-lg text-muted mb-6">
                An open standard for controlling how AI agents access credentials and environment variables.
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-muted">
                <span>Version <strong className="text-fg">1.0</strong></span>
                <span className="text-[#1b0c25]/20">|</span>
                <span>Date <strong className="text-fg">2026-03-03</strong></span>
                <span className="text-[#1b0c25]/20">|</span>
                <span>License <strong className="text-fg">MIT</strong></span>
              </div>
            </div>

            {/* Abstract */}
            <div className="card-glow p-6 lg:p-8 mb-12">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mb-3">Abstract</h3>
              <p className="text-sm text-muted leading-relaxed">
                ACSS defines a protocol for controlling how AI agents access credentials and environment variables.
                It specifies a profile-based permission model, a three-state access decision system (allow, deny, redact),
                an encrypted secret vault format, an immutable audit trail, and a session management lifecycle.
                ACSS enables any tool, framework, or platform to implement consistent, auditable, and revocable
                credential access for AI agents.
              </p>
            </div>

            {/* ─── 1. Introduction ─── */}
            <SectionHeading id="introduction" icon={BookOpen} title="Introduction" desc="Why ACSS exists and the problem it solves." />

            <div className="card-glow p-6 lg:p-8 mb-6">
              <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-fg mb-3">The Problem</h3>
              <p className="text-sm text-muted leading-relaxed mb-4">
                AI agents &mdash; including coding assistants (Cursor, Claude Code, GitHub Copilot), orchestration frameworks
                (LangChain, CrewAI, AutoGPT), and autonomous systems &mdash; routinely execute with full access to the host
                environment&apos;s credentials. There is no standard mechanism to scope, audit, or revoke this access.
              </p>
              <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-fg mb-3">Design Principles</h3>
              <div className="space-y-2">
                {[
                  ["Local-first", "All data stays on the user\u2019s machine. No network calls required."],
                  ["Deny by default", "Credentials are denied unless explicitly allowed by a profile rule."],
                  ["Audit everything", "Every access decision MUST be logged before enforcement."],
                  ["Simple to implement", "The core algorithm is implementable in any language in under 50 lines."],
                  ["Framework-agnostic", "Works with any agent, tool, or runtime that uses environment variables."],
                  ["Human-readable", "Profiles are YAML. Audit logs are queryable SQL. Vault entries are JSON."],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-3 text-sm">
                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div><strong className="text-fg">{title}.</strong> <span className="text-muted">{desc}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <InfoBox label="Terminology">
              This specification uses RFC 2119 keywords: MUST, MUST NOT, REQUIRED, SHALL, SHOULD, RECOMMENDED, MAY, and OPTIONAL.
            </InfoBox>

            {/* ─── 2. Architecture ─── */}
            <SectionHeading id="architecture" icon={Layers} title="Architecture" desc="Components and execution flow of an ACSS-compliant implementation." />

            <SpecTable
              headers={["Component", "Responsibility"]}
              rows={[
                ["Vault", "Encrypted storage of credentials (secrets) at rest"],
                ["Profiles", "Declarative permission rules controlling access"],
                ["Sandbox", "Runtime environment filtering based on profile evaluation"],
                ["Audit", "Immutable log of all access decisions"],
                ["Sessions", "Lifecycle tracking and revocation of agent access"],
              ]}
            />

            <CodeBlock title="Execution Flow">{`1. User invokes agent with a profile
2. Create session (UUID, agent ID, profile name, PID, timestamp)
3. Load credentials from vault + host environment
4. For each credential:
   a. Check if system variable → passthrough
   b. Evaluate profile rules (last-match-wins)
   c. Log access decision to audit trail
   d. Apply decision: allow | deny | redact
5. Inject session metadata into environment
6. Spawn agent process with filtered environment
7. On exit: mark session inactive`}</CodeBlock>

            <CodeBlock title="Architecture Diagram">{`┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AI Agent   │────▸│   Sandbox    │────▸│    Vault     │
│  (child proc)│     │  (evaluate   │     │  (encrypted  │
│              │◂────│   + filter)  │◂────│   secrets)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │   Profile    │
                     │  (rules +   │
                     │  trust level)│
                     └──────┬───────┘
                            │
                     ┌──────┴───────┐
                     │  Audit Trail │
                     │  (every      │
                     │   decision)  │
                     └──────────────┘`}</CodeBlock>

            {/* ─── 3. Permission Profiles ─── */}
            <SectionHeading id="profiles" icon={Shield} title="Permission Profiles" desc="Declarative YAML-based rules that control credential access." />

            <CodeBlock title="Profile Schema" lang="YAML">{`name: moderate               # REQUIRED. Lowercase alphanumeric + hyphens.
description: "Balanced..."   # REQUIRED. Human-readable purpose.
trustLevel: 50               # REQUIRED. 0-100 inclusive.
ttlSeconds: 3600             # REQUIRED. Max session duration. 0 = unlimited.
rules:                       # REQUIRED. Ordered array of rules.
  - pattern: "*"             #   Wildcard — match all
    access: deny             #   One of: allow, deny, redact
  - pattern: NODE_ENV        #   Exact match
    access: allow
  - pattern: AWS_*           #   Prefix match
    access: redact`}</CodeBlock>

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">Pattern Matching</h3>
            <SpecTable
              headers={["Pattern", "Type", "Matches"]}
              rows={[
                ["*", "Wildcard", "All variable names"],
                ["PREFIX_*", "Prefix", "Names starting with PREFIX_"],
                ["EXACT", "Exact", "Only the exact variable name"],
              ]}
            />

            <CodeBlock title="Match Algorithm" lang="pseudocode">{`function matchRule(varName, pattern):
    if pattern == "*":
        return true
    if pattern ends with "*":
        return varName starts with pattern[0..length-1]
    return varName == pattern`}</CodeBlock>

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">Rule Evaluation: Last-Match-Wins</h3>
            <p className="text-sm text-muted leading-relaxed mb-4">
              Rules are evaluated in order. The last matching rule determines the access decision.
              This allows profiles to start with a broad default and layer specific overrides.
            </p>

            <CodeBlock title="Evaluation Algorithm" lang="pseudocode">{`function checkAccess(profile, varName):
    result = "deny"                    # Default if no rules match
    for each rule in profile.rules:    # Iterate in order
        if matchRule(varName, rule.pattern):
            result = rule.access       # Overwrite with latest match
    return result`}</CodeBlock>

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">Trust Levels</h3>
            <SpecTable
              headers={["Range", "Label", "Typical Use"]}
              rows={[
                ["0\u201325", "Restrictive", "Untrusted or unknown agents. Minimal access."],
                ["26\u201350", "Moderate", "Known agents with limited access. Redact sensitive credentials."],
                ["51\u201375", "Elevated", "Trusted agents with broad access."],
                ["76\u2013100", "Permissive", "Fully trusted agents. Allow everything, audit all."],
              ]}
            />

            {/* ─── 4. Access Decision Model ─── */}
            <SectionHeading id="access-model" icon={CheckCircle} title="Access Decision Model" desc="The four-state decision model applied to every credential." />

            <SpecTable
              headers={["Decision", "Meaning", "Behavior"]}
              rows={[
                ["allow", "Credential is permitted", "Pass the original value to the agent"],
                ["deny", "Credential is forbidden", "Exclude the variable entirely"],
                ["redact", "Credential is masked", "Pass the name with a redaction token as value"],
                ["system", "System variable bypass", "Pass unconditionally (not logged)"],
              ]}
            />

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">System Variables</h3>
            <p className="text-sm text-muted leading-relaxed mb-3">
              These variables MUST always pass through sandboxing. They are essential for process execution.
            </p>
            <CodeBlock title="Required System Variables">{`PATH  HOME  USER  SHELL  TERM  LANG  LC_ALL  TMPDIR  NODE_PATH`}</CodeBlock>

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">Redaction Format</h3>
            <CodeBlock title="Redaction Token Format">{`VAULT_REDACTED_<hex>

# Example:
AWS_SECRET_KEY=VAULT_REDACTED_a1b2c3d4
DATABASE_URL=VAULT_REDACTED_e5f6a7b8

# <hex> = cryptographically random, at least 8 hex chars (4 bytes)
# Each redaction generates a unique token`}</CodeBlock>

            {/* ─── 5. Vault Encryption ─── */}
            <SectionHeading id="vault" icon={Lock} title="Vault Encryption" desc="AES-256-GCM encrypted credential storage at rest." />

            <SpecTable
              headers={["Parameter", "Value"]}
              rows={[
                ["Algorithm", "AES-256-GCM (authenticated encryption)"],
                ["Key Derivation", "scrypt (salt \u2265 16 bytes, output 32 bytes)"],
                ["IV", "Random, \u2265 12 bytes (recommended: 16 bytes). New IV per write."],
                ["Auth Tag", "GCM authentication tag (prevents tampering)"],
              ]}
            />

            <CodeBlock title="Ciphertext Format" lang="JSON">{`{
  "iv": "<hex-encoded initialization vector>",
  "tag": "<hex-encoded authentication tag>",
  "data": "<hex-encoded ciphertext>"
}`}</CodeBlock>

            <CodeBlock title="Vault Entry Schema" lang="JSON">{`[
  {
    "key": "AWS_SECRET_KEY",
    "value": "sk-abc123...",
    "addedAt": "2026-03-03T10:30:00Z"
  }
]`}</CodeBlock>

            <InfoBox label="Passphrase Resolution">
              1. Environment variable (AGENTVAULT_PASSPHRASE) &rarr; 2. Passphrase file (.agentvault/.passphrase) &rarr; 3. Default passphrase (dev only)
            </InfoBox>

            {/* ─── 6. Audit Trail ─── */}
            <SectionHeading id="audit" icon={FileText} title="Audit Trail" desc="Immutable log of every credential access decision." />

            <SpecTable
              headers={["Field", "Type", "Description"]}
              rows={[
                ["id", "integer", "Auto-incremented sequential identifier"],
                ["sessionId", "string (UUID)", "Links to the active session"],
                ["agentId", "string", "Identifies the agent"],
                ["profileName", "string", "Profile used for evaluation"],
                ["varName", "string", "Credential name evaluated"],
                ["action", 'string (enum)', '"allow", "deny", or "redact"'],
                ["timestamp", "string (ISO 8601)", "When the decision was made"],
              ]}
            />

            <CodeBlock title="SQLite Schema (Recommended)" lang="SQL">{`CREATE TABLE audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    agentId TEXT NOT NULL,
    profileName TEXT NOT NULL,
    varName TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL
);`}</CodeBlock>

            <InfoBox label="Requirement">
              Audit entries MUST be written before the access decision is enforced. The trail MUST be append-only.
            </InfoBox>

            {/* ─── 7. Session Management ─── */}
            <SectionHeading id="sessions" icon={Activity} title="Session Management" desc="Lifecycle tracking, metadata injection, and revocation." />

            <SpecTable
              headers={["Field", "Type", "Description"]}
              rows={[
                ["id", "string (UUID v4)", "Unique session identifier"],
                ["agentId", "string", "Agent running in this session"],
                ["profileName", "string", "Profile applied"],
                ["pid", "integer", "OS process ID of the agent"],
                ["startedAt", "string (ISO 8601)", "Session creation time"],
                ["active", "boolean", "False when revoked or expired"],
              ]}
            />

            <CodeBlock title="Lifecycle">{`Created  ──▸  Active  ──▸  Revoked / Expired
   │              │                │
session ID    audit logging     PID signaled
assigned      in progress       (SIGTERM)`}</CodeBlock>

            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-8 mb-4">Runtime Metadata Injection</h3>
            <SpecTable
              headers={["Variable", "Value", "Purpose"]}
              rows={[
                ["AGENTVAULT_SESSION", "Session UUID", "Agent can identify its session"],
                ["AGENTVAULT_PROFILE", "Profile name", "Agent knows which profile is active"],
                ["AGENTVAULT_TRUST", "Trust level (string)", "Agent knows its trust level"],
              ]}
            />

            {/* ─── 8. Directory Structure ─── */}
            <SectionHeading id="directory" icon={FolderTree} title="Directory Structure" desc="Standard layout for ACSS data on the filesystem." />

            <CodeBlock title=".agentvault/ Layout">{`.agentvault/
├── profiles/              # Permission profile YAML files
│   ├── restrictive.yml
│   ├── moderate.yml
│   └── permissive.yml
├── vault.enc              # AES-256-GCM encrypted credentials
├── sessions.json          # Active session tracking
├── audit.db               # SQLite audit trail
├── .passphrase            # Encryption passphrase (mode 0600)
└── .gitignore             # Contains: *  !.gitignore`}</CodeBlock>

            <SpecTable
              headers={["File", "Format", "Description"]}
              rows={[
                ["profiles/*.yml", "YAML", "Permission profiles"],
                ["vault.enc", "JSON (encrypted)", "Encrypted vault"],
                ["sessions.json", "JSON", "Array of Session objects"],
                ["audit.db", "SQLite", "Audit trail database"],
                [".passphrase", "Plain text", "Encryption passphrase (mode 0600)"],
                [".gitignore", "Text", "Prevents accidental commits"],
              ]}
            />

            {/* ─── 9. Security ─── */}
            <SectionHeading id="security" icon={AlertTriangle} title="Security Considerations" desc="Requirements for secure ACSS implementations." />

            <div className="space-y-4">
              {[
                ["Encryption at Rest", "All credentials MUST be encrypted using AES-256-GCM. Decrypted values MUST only exist in memory during sandbox evaluation."],
                ["Passphrase Management", "The .passphrase file MUST have mode 0600. Implementations SHOULD validate minimum 8 characters. Warn when default passphrase is in use."],
                ["Process Isolation", "The agent MUST run as a child process. Denied variables MUST NOT be present in the child environment. Redaction tokens MUST be cryptographically random."],
                ["Audit Integrity", "Entries MUST be written before enforcement. The trail MUST be append-only. Individual entry deletion SHOULD NOT be permitted."],
                [".gitignore Protection", "The .agentvault/.gitignore MUST prevent accidental commit of sensitive data."],
              ].map(([title, desc]) => (
                <div key={title} className="card-glow p-6">
                  <h4 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-fg mb-2">{title}</h4>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* ─── 10. Conformance ─── */}
            <SectionHeading id="conformance" icon={CheckCircle} title="Conformance Levels" desc="What implementations must and should support." />

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card-glow p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trust-green/10 text-trust-green text-xs font-medium mb-4">
                  Level 1 — Core
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-base font-semibold text-fg mb-3">Required</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {["Profile schema and rule matching", "Three-state access model", "System variable passthrough", "Audit trail logging"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-trust-green shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-glow p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                  Level 2 — Full
                </div>
                <h4 className="font-[family-name:var(--font-heading)] text-base font-semibold text-fg mb-3">Recommended</h4>
                <ul className="space-y-2 text-sm text-muted">
                  {["Everything in Level 1", "Encrypted vault", "Session management + revocation", "Runtime metadata injection", "TTL enforcement", "Standard directory structure"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* JSON Schema Downloads */}
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-fg mt-12 mb-4">JSON Schemas</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-12">
              {[
                { name: "profile.schema.json", desc: "Profile + PermissionRule" },
                { name: "audit-entry.schema.json", desc: "Audit Entry" },
                { name: "vault-entry.schema.json", desc: "Vault Entry" },
                { name: "session.schema.json", desc: "Session" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={`https://github.com/agentvault/agentvault/tree/main/spec/schema/v1.0/${s.name}`}
                  className="flex items-center gap-3 card-glow p-4 hover:border-primary/30 transition-colors"
                >
                  <Download className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <code className="text-xs text-fg font-[family-name:var(--font-mono)]">{s.name}</code>
                    <p className="text-xs text-muted mt-0.5">{s.desc}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Reference Implementation */}
            <div className="card-glow p-6 lg:p-8 text-center">
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-fg mb-3">Reference Implementation</h3>
              <p className="text-sm text-muted mb-6">
                AgentVault is the reference implementation of ACSS Level 2 (Full conformance).
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://github.com/agentvault/agentvault" className="btn-primary inline-flex items-center gap-2 text-sm">
                  View on GitHub
                  <ChevronRight className="w-4 h-4" />
                </a>
                <a href="/documentation" className="btn-secondary text-sm">
                  CLI Documentation
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
