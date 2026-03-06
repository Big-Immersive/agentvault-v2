# Agent Credential Sandboxing Standard (ACSS) v1.0

**Version:** 1.0
**Date:** 2026-03-03
**Status:** Draft
**License:** MIT
**Reference Implementation:** [AgentVault](https://github.com/agentvault/agentvault)

---

## Abstract

The Agent Credential Sandboxing Standard (ACSS) defines a protocol for controlling how AI agents access credentials and environment variables. It specifies a profile-based permission model, a three-state access decision system, an encrypted secret vault format, an immutable audit trail, and a session management lifecycle. ACSS enables any tool, framework, or platform to implement consistent, auditable, and revocable credential access for AI agents.

---

## Status of This Document

This document is a **Draft** specification. It is published to solicit feedback from the community. Breaking changes may occur before v1.0 is finalized.

---

## 1. Introduction

### 1.1 Purpose

AI agents — including coding assistants (Cursor, Claude Code, GitHub Copilot), orchestration frameworks (LangChain, CrewAI, AutoGPT), and autonomous systems — routinely execute with full access to the host environment's credentials. There is no standard mechanism to scope, audit, or revoke this access.

ACSS addresses this gap by defining:

1. **Permission Profiles** — declarative rules that determine which credentials an agent can access
2. **Access Decisions** — a three-state model (allow, deny, redact) applied to each credential
3. **Encrypted Vault** — a format for storing secrets encrypted at rest
4. **Audit Trail** — an immutable log of every access decision
5. **Session Management** — a lifecycle for tracking and revoking agent access

### 1.2 Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://datatracker.ietf.org/doc/html/bcp14) [[RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119)] [[RFC 8174](https://datatracker.ietf.org/doc/html/rfc8174)] when, and only when, they appear in all capitals, as shown here.

**Definitions:**

- **Agent** — An AI system that executes actions on behalf of a user, potentially requiring access to credentials.
- **Credential** — Any sensitive value: API key, database URL, access token, secret key, or environment variable containing sensitive data.
- **Profile** — A named set of permission rules that determines how credentials are exposed to an agent.
- **Sandbox** — An execution environment where credential access is filtered according to a profile.
- **Session** — A bounded execution context linking an agent invocation to a profile and audit trail.
- **Vault** — An encrypted store of credentials on the local filesystem.

### 1.3 Design Principles

1. **Local-first** — All data stays on the user's machine. No network calls required.
2. **Deny by default** — Credentials are denied unless explicitly allowed by a profile rule.
3. **Audit everything** — Every access decision MUST be logged before enforcement.
4. **Simple to implement** — The core algorithm (pattern matching + last-match-wins) is implementable in any language in under 50 lines.
5. **Framework-agnostic** — ACSS works with any agent, tool, or runtime that uses environment variables.
6. **Human-readable** — Profiles are YAML. Audit logs are queryable SQL. Vault entries have clear JSON structure.

---

## 2. Architecture Overview

### 2.1 Components

An ACSS-compliant implementation MUST provide these components:

| Component | Responsibility |
|---|---|
| **Vault** | Encrypted storage of credentials (secrets) at rest |
| **Profiles** | Declarative permission rules controlling access |
| **Sandbox** | Runtime environment filtering based on profile evaluation |
| **Audit** | Immutable log of all access decisions |
| **Sessions** | Lifecycle tracking and revocation of agent access |

### 2.2 Execution Flow

The standard execution flow for a sandboxed agent invocation:

```
1. User invokes agent with a profile
2. Create session (UUID, agent ID, profile name, PID, timestamp)
3. Load credentials from vault + host environment
4. For each credential:
   a. Check if system variable → passthrough
   b. Evaluate profile rules (last-match-wins)
   c. Log access decision to audit trail
   d. Apply decision: allow (pass value), deny (exclude), redact (replace with token)
5. Inject session metadata into environment
6. Spawn agent process with filtered environment
7. On exit: mark session inactive
```

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
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
                     └──────────────┘
```

---

## 3. Permission Profiles

### 3.1 Profile Schema

A profile MUST be a YAML document conforming to the following schema:

```yaml
name: <string>           # REQUIRED. Unique identifier. Lowercase alphanumeric + hyphens.
description: <string>    # REQUIRED. Human-readable purpose statement.
trustLevel: <integer>    # REQUIRED. 0-100 inclusive. Higher = more trusted.
ttlSeconds: <integer>    # REQUIRED. Maximum session duration in seconds. 0 = unlimited.
rules:                   # REQUIRED. Ordered array of permission rules.
  - pattern: <string>    #   REQUIRED. Match pattern (see §3.3).
    access: <string>     #   REQUIRED. One of: "allow", "deny", "redact".
```

**Constraints:**

- `name` MUST match the regex `^[a-z0-9][a-z0-9-]*$`
- `trustLevel` MUST be an integer in the range [0, 100]
- `ttlSeconds` MUST be a non-negative integer
- `rules` MUST contain at least one rule
- A profile SHOULD begin with a `pattern: "*"` rule to set a default policy

### 3.2 Permission Rules

Each rule defines a pattern-to-access mapping:

```yaml
- pattern: "*"            # Match all variables → deny by default
  access: deny
- pattern: NODE_ENV       # Exact match → allow
  access: allow
- pattern: AWS_*          # Prefix match → redact
  access: redact
```

The `access` field MUST be one of:

| Value | Behavior |
|---|---|
| `allow` | The credential value is passed to the agent unchanged |
| `deny` | The credential is excluded from the agent's environment entirely |
| `redact` | The credential name is present but the value is replaced with a redaction token |

### 3.3 Pattern Matching

Implementations MUST support three pattern types:

| Pattern | Type | Matches | Examples |
|---|---|---|---|
| `*` | Wildcard | All variable names | Matches everything |
| `PREFIX_*` | Prefix | Names starting with `PREFIX_` | `AWS_*` matches `AWS_SECRET_KEY`, `AWS_REGION` |
| `EXACT` | Exact | Only the exact name | `NODE_ENV` matches only `NODE_ENV` |

**Algorithm:**

```
function matchRule(varName: string, pattern: string) -> boolean:
    if pattern == "*":
        return true
    if pattern ends with "*":
        return varName starts with pattern[0..length-1]
    return varName == pattern
```

Implementations MUST NOT support regular expressions or any pattern syntax beyond these three types. This constraint ensures deterministic, cross-implementation consistency.

### 3.4 Rule Evaluation

Rules MUST be evaluated using **last-match-wins** semantics:

```
function checkAccess(profile: Profile, varName: string) -> "allow" | "deny" | "redact":
    result = "deny"                           # Default if no rules match
    for each rule in profile.rules:           # Iterate in order
        if matchRule(varName, rule.pattern):
            result = rule.access              # Overwrite with latest match
    return result
```

**Rationale:** Last-match-wins allows profiles to start with a broad default (`*` → deny) and layer specific overrides. This is the same evaluation model used by `.gitignore`, CSS specificity, and firewall rules.

### 3.5 Trust Levels

The `trustLevel` field is an integer from 0 to 100 indicating the degree of trust granted to the agent:

| Range | Label | Typical Use |
|---|---|---|
| 0–25 | Restrictive | Untrusted or unknown agents. Minimal access. |
| 26–50 | Moderate | Known agents with limited access. Redact sensitive credentials. |
| 51–75 | Elevated | Trusted agents with broad access. Allow most credentials. |
| 76–100 | Permissive | Fully trusted agents. Allow everything, audit all access. |

Implementations MAY use `trustLevel` for runtime decisions (e.g., blocking operations above a threshold). The value MUST be injected into the sandbox environment as `AGENTVAULT_TRUST` (see §7.3).

### 3.6 Session TTL

The `ttlSeconds` field specifies the maximum duration of a sandboxed session:

- When `ttlSeconds > 0`, the session MUST be terminated after the specified duration
- When `ttlSeconds == 0`, the session has no timeout (runs until the agent process exits)
- Implementations SHOULD terminate sessions by sending `SIGTERM` (Unix) or equivalent

---

## 4. Access Decision Model

### 4.1 Decision Types

For every credential evaluated, the sandbox MUST produce one of four decision types:

| Decision | Meaning | Behavior |
|---|---|---|
| `allow` | Credential is permitted | Pass the original value to the agent |
| `deny` | Credential is forbidden | Exclude the variable entirely from the agent's environment |
| `redact` | Credential is masked | Pass the variable name with a redaction token as the value |
| `system` | System variable bypass | Pass the original value unconditionally (not logged) |

### 4.2 System Variables

The following environment variables MUST always pass through sandboxing with the `system` decision. They are essential for process execution and MUST NOT be subject to profile rules:

```
PATH
HOME
USER
SHELL
TERM
LANG
LC_ALL
TMPDIR
NODE_PATH
```

Implementations MAY extend this list with platform-specific variables but MUST include at minimum the variables listed above.

System variable decisions SHOULD NOT be written to the audit trail, as they generate noise without security value.

### 4.3 Redaction Format

When a credential is redacted, the implementation MUST replace its value with a token in the following format:

```
VAULT_REDACTED_<hex>
```

Where `<hex>` is a cryptographically random hexadecimal string of at least 8 characters (4 bytes). Each redaction MUST generate a unique token to prevent agents from correlating redacted values across variables.

**Example:**
```
AWS_SECRET_KEY=VAULT_REDACTED_a1b2c3d4
DATABASE_URL=VAULT_REDACTED_e5f6a7b8
```

---

## 5. Vault Encryption

### 5.1 Encryption Algorithm

Credentials stored in the vault MUST be encrypted using **AES-256-GCM** (Galois/Counter Mode). This provides both confidentiality and authenticity (authenticated encryption).

### 5.2 Key Derivation

The encryption key MUST be derived from a user-provided passphrase using **scrypt**:

| Parameter | Value |
|---|---|
| Algorithm | scrypt |
| Salt | Implementation-defined (MUST be at least 16 bytes) |
| Output length | 32 bytes (256 bits) |
| Cost (N) | Implementation-defined (RECOMMENDED: 2^14 or higher) |

**Passphrase resolution order:**

1. Environment variable (`AGENTVAULT_PASSPHRASE`) — highest priority
2. Passphrase file (`.agentvault/.passphrase`) — set during initialization
3. Default passphrase — lowest priority, for local development only

Implementations SHOULD warn users when the default passphrase is in use.

### 5.3 Ciphertext Format

The encrypted vault file MUST be a JSON document with the following structure:

```json
{
  "iv": "<hex-encoded initialization vector>",
  "tag": "<hex-encoded authentication tag>",
  "data": "<hex-encoded ciphertext>"
}
```

| Field | Type | Description |
|---|---|---|
| `iv` | string | Hex-encoded initialization vector (MUST be at least 12 bytes, RECOMMENDED: 16 bytes) |
| `tag` | string | Hex-encoded GCM authentication tag |
| `data` | string | Hex-encoded ciphertext (encrypted JSON array of VaultEntry objects) |

A new random IV MUST be generated for every write operation. Reusing IVs with the same key is a critical security vulnerability.

### 5.4 Vault Entry Schema

The decrypted vault contains a JSON array of entry objects:

```json
[
  {
    "key": "AWS_SECRET_KEY",
    "value": "sk-abc123...",
    "addedAt": "2026-03-03T10:30:00Z"
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `key` | string | Yes | The credential name (environment variable name) |
| `value` | string | Yes | The credential value (plaintext when decrypted) |
| `addedAt` | string | Yes | ISO 8601 timestamp of when the entry was added or last updated |

---

## 6. Audit Trail

### 6.1 Entry Schema

Every non-system access decision MUST be logged as an audit entry with the following fields:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Auto | Sequential identifier, auto-incremented |
| `sessionId` | string | Yes | UUID of the active session |
| `agentId` | string | Yes | Identifier of the agent |
| `profileName` | string | Yes | Name of the profile used for evaluation |
| `varName` | string | Yes | The credential name that was evaluated |
| `action` | string | Yes | The access decision: `"allow"`, `"deny"`, or `"redact"` |
| `timestamp` | string | Yes | ISO 8601 timestamp of the decision |

### 6.2 Storage Requirements

- The audit trail MUST be append-only. Entries MUST NOT be modified after creation.
- Implementations SHOULD use SQLite for storage. The RECOMMENDED schema:

```sql
CREATE TABLE audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    agentId TEXT NOT NULL,
    profileName TEXT NOT NULL,
    varName TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL
);
```

- Alternative storage backends (PostgreSQL, flat files, etc.) are permitted if they maintain append-only semantics and support the query interface defined in §6.3.

### 6.3 Query Interface

Implementations MUST support querying audit entries by:

- `sessionId` — all decisions for a specific session
- `agentId` — all decisions for a specific agent
- Combination of both
- Most recent N entries (reverse chronological)

### 6.4 Export Formats

Implementations SHOULD support exporting audit data in:

- **JSON** — array of audit entry objects
- **CSV** — with headers matching the field names in §6.1

---

## 7. Session Management

### 7.1 Session Schema

A session represents a bounded agent execution context:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | UUID v4 uniquely identifying this session |
| `agentId` | string | Yes | Identifier of the agent |
| `profileName` | string | Yes | Name of the profile applied |
| `pid` | integer | Yes | Operating system process ID of the agent |
| `startedAt` | string | Yes | ISO 8601 timestamp of session creation |
| `active` | boolean | Yes | Whether the session is currently running |

### 7.2 Lifecycle

```
┌─────────┐     ┌───────────┐     ┌───────────┐
│ Created  │────▸│  Active   │────▸│ Revoked / │
│          │     │           │     │  Expired  │
└─────────┘     └───────────┘     └───────────┘
     │                │                  │
     │                │                  │
  session ID      audit logging      PID signaled
  assigned        in progress        (SIGTERM)
```

1. **Create:** A session MUST be created before any access decisions are evaluated. The session ID MUST be a UUID v4.
2. **Active:** While active, all access decisions are correlated to this session via `sessionId`.
3. **Revoke:** Revocation MUST set `active = false` and SHOULD send `SIGTERM` to the process identified by `pid`.
4. **Expire:** If `ttlSeconds > 0`, the session MUST be automatically revoked after the TTL expires.
5. **Revoke All:** Implementations MUST support revoking all active sessions simultaneously (emergency kill switch).

### 7.3 Runtime Metadata Injection

The sandbox MUST inject the following environment variables into the agent's environment:

| Variable | Value | Purpose |
|---|---|---|
| `AGENTVAULT_SESSION` | Session UUID | Allows the agent to identify its session |
| `AGENTVAULT_PROFILE` | Profile name | Allows the agent to know which profile is active |
| `AGENTVAULT_TRUST` | Trust level (string) | Allows the agent to know its trust level |

These variables MUST NOT be subject to profile rules.

---

## 8. Directory Structure

### 8.1 .agentvault/ Layout

An ACSS-compliant implementation MUST store all data under a `.agentvault/` directory relative to the project root:

```
.agentvault/
├── profiles/              # Permission profile YAML files
│   ├── restrictive.yml
│   ├── moderate.yml
│   └── permissive.yml
├── vault.enc              # AES-256-GCM encrypted credentials
├── sessions.json          # Active session tracking
├── audit.db               # SQLite audit trail
├── .passphrase            # Encryption passphrase (optional)
└── .gitignore             # MUST ignore sensitive files
```

### 8.2 File Formats

| File | Format | Description |
|---|---|---|
| `profiles/*.yml` | YAML | Permission profiles (see §3) |
| `vault.enc` | JSON (encrypted) | Encrypted vault (see §5.3) |
| `sessions.json` | JSON | Array of Session objects (see §7.1) |
| `audit.db` | SQLite | Audit trail database (see §6.2) |
| `.passphrase` | Plain text | Encryption passphrase. MUST have mode 0600. |
| `.gitignore` | Text | MUST contain `*` and `!.gitignore` to prevent accidental commits |

---

## 9. Security Considerations

### 9.1 Encryption at Rest

- All credentials MUST be encrypted at rest using AES-256-GCM (see §5)
- The vault file MUST NOT contain plaintext credentials
- Decrypted credentials MUST only exist in memory during sandbox evaluation

### 9.2 Passphrase Management

- The `.passphrase` file MUST have filesystem permissions mode `0600` (owner read/write only)
- Implementations SHOULD validate passphrase strength (RECOMMENDED: minimum 8 characters)
- The default passphrase SHOULD only be used for local development. Implementations SHOULD warn when it is in use.

### 9.3 Process Isolation

- The sandboxed agent MUST run as a child process, not in the same process
- Environment variables denied by the profile MUST NOT be present in the child process environment
- Redacted values MUST use cryptographically random tokens (see §4.3)

### 9.4 Audit Integrity

- Audit entries MUST be written before the access decision is enforced
- The audit trail MUST be append-only
- Implementations SHOULD NOT allow deletion of individual audit entries (bulk clear is permitted for maintenance)

### 9.5 .gitignore Protection

- The `.agentvault/.gitignore` file MUST contain rules to prevent accidental commit of sensitive data
- At minimum: `*` followed by `!.gitignore` (ignore everything except the .gitignore itself)

---

## 10. Conformance

### 10.1 Conformance Levels

ACSS defines two conformance levels:

**Level 1 — Core (REQUIRED):**
- Permission profiles with pattern matching (§3)
- Three-state access decisions (§4)
- Sandbox environment filtering (§2.2, §4)
- Audit trail logging (§6)

**Level 2 — Full (RECOMMENDED):**
- Everything in Level 1, plus:
- Encrypted vault (§5)
- Session management with revocation (§7)
- Runtime metadata injection (§7.3)
- Standard directory structure (§8)
- TTL enforcement (§3.6)

### 10.2 Required vs Optional Features

| Feature | Level 1 | Level 2 |
|---|---|---|
| Profile schema and rule matching | REQUIRED | REQUIRED |
| Three-state access model | REQUIRED | REQUIRED |
| System variable passthrough | REQUIRED | REQUIRED |
| Audit trail | REQUIRED | REQUIRED |
| Encrypted vault | OPTIONAL | REQUIRED |
| Session management | OPTIONAL | REQUIRED |
| Session revocation | OPTIONAL | REQUIRED |
| TTL enforcement | OPTIONAL | REQUIRED |
| Runtime metadata injection | OPTIONAL | REQUIRED |
| Directory structure | OPTIONAL | REQUIRED |
| Audit export (JSON/CSV) | OPTIONAL | OPTIONAL |

---

## Appendix A: JSON Schema

Machine-readable JSON Schemas for all ACSS data types are available at:

- [`profile.schema.json`](schema/v1.0/profile.schema.json)
- [`audit-entry.schema.json`](schema/v1.0/audit-entry.schema.json)
- [`vault-entry.schema.json`](schema/v1.0/vault-entry.schema.json)
- [`session.schema.json`](schema/v1.0/session.schema.json)

---

## Appendix B: Example Profiles

### Restrictive (Trust Level: 10)

Denies everything except system variables. For untrusted or unknown agents.

```yaml
name: restrictive
description: Minimal access — denies everything except system vars
trustLevel: 10
ttlSeconds: 300
rules:
  - pattern: "*"
    access: deny
```

### Moderate (Trust Level: 50)

Allows common development variables, redacts cloud credentials.

```yaml
name: moderate
description: Balanced — allows dev vars, redacts secrets, denies cloud credentials
trustLevel: 50
ttlSeconds: 3600
rules:
  - pattern: "*"
    access: deny
  - pattern: NODE_ENV
    access: allow
  - pattern: NPM_*
    access: allow
  - pattern: DEBUG
    access: allow
  - pattern: LOG_LEVEL
    access: allow
  - pattern: PORT
    access: allow
  - pattern: HOST
    access: allow
  - pattern: DATABASE_URL
    access: redact
  - pattern: AWS_*
    access: redact
  - pattern: OPENAI_*
    access: redact
  - pattern: ANTHROPIC_*
    access: redact
```

### Permissive (Trust Level: 90)

Allows everything with full audit trail. For trusted agents.

```yaml
name: permissive
description: Full access with audit trail — allows everything, logs all access
trustLevel: 90
ttlSeconds: 86400
rules:
  - pattern: "*"
    access: allow
```

### CI Read-Only (Trust Level: 30)

Allows CI variables, denies all secrets.

```yaml
name: ci-readonly
description: Read-only CI environment — allows CI vars, denies all secrets
trustLevel: 30
ttlSeconds: 600
rules:
  - pattern: "*"
    access: deny
  - pattern: CI
    access: allow
  - pattern: CI_*
    access: allow
  - pattern: GITHUB_*
    access: allow
  - pattern: NODE_ENV
    access: allow
  - pattern: NPM_*
    access: allow
```

### Cloud Redact (Trust Level: 40)

Allows dev vars, redacts all cloud provider credentials.

```yaml
name: cloud-redact
description: Allows dev vars, redacts all cloud provider credentials
trustLevel: 40
ttlSeconds: 1800
rules:
  - pattern: "*"
    access: deny
  - pattern: NODE_ENV
    access: allow
  - pattern: PORT
    access: allow
  - pattern: HOST
    access: allow
  - pattern: DEBUG
    access: allow
  - pattern: AWS_*
    access: redact
  - pattern: GCP_*
    access: redact
  - pattern: AZURE_*
    access: redact
  - pattern: OPENAI_*
    access: redact
  - pattern: ANTHROPIC_*
    access: redact
  - pattern: DATABASE_URL
    access: redact
```

---

## Appendix C: Reference Implementation

The reference implementation of ACSS is [AgentVault](https://github.com/agentvault/agentvault), a TypeScript CLI tool that implements Level 2 (Full) conformance.

**Install:**
```bash
npm install -g agentvault
```

**Usage:**
```bash
agentvault init                              # Initialize vault
agentvault secret add AWS_KEY "sk-..."       # Add encrypted credential
agentvault wrap -p moderate "claude-code ."  # Run agent in sandbox
agentvault audit show                        # View access log
agentvault revoke --all                      # Emergency kill switch
```

---

*ACSS is an open standard. Contributions welcome at [github.com/agentvault/agentvault](https://github.com/agentvault/agentvault).*
