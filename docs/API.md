# AgentVault API — Agentic Credential Gating

## Architecture Overview

AgentVault operates in two modes:

### Mode 1: CLI Wrap (Current — Process-level)
```
Developer → `agentvault wrap -p moderate "claude-code ."` → Sandboxed subprocess
```
The agent runs inside a filtered environment. Simple, local, zero-config.

### Mode 2: API Gateway (New — Platform-level)
```
Agent → AgentVault API → Credential Decision Engine → Scoped Token/Secret
```
The agent explicitly requests credentials through AgentVault's API. AgentVault decides what to grant based on the agent's identity, trust level, active profile, and behavioral context.

This is the **enterprise pattern**. Instead of wrapping a process, AgentVault becomes a credential gateway that sits between any agent framework and your secrets.

---

## Core Concepts

### Agent Identity
Every agent registers with AgentVault and receives an `agent_id` + `agent_secret`. This is the agent's identity — used for all credential requests.

```json
{
  "agent_id": "agt_cursor_7f3a",
  "agent_name": "cursor-main",
  "framework": "cursor",
  "trust_level": 50,
  "profile": "moderate",
  "created_at": "2026-02-14T03:30:00Z",
  "session_ttl": 3600
}
```

### Credential Request
An agent doesn't access env vars directly. It asks AgentVault for a specific credential.

```
POST /v1/credentials/request
{
  "agent_id": "agt_cursor_7f3a",
  "credential_name": "AWS_SECRET_ACCESS_KEY",
  "purpose": "Deploy to S3 bucket",
  "scope": "s3:PutObject"
}
```

AgentVault evaluates the request against the agent's profile and returns one of:
- **ALLOW** — returns the actual credential (or a scoped, short-lived derivative)
- **REDACT** — returns a dummy token (`VAULT_REDACTED_xxxx`) 
- **DENY** — returns 403 with reason

### Scoped Tokens
For supported providers (AWS, GitHub, etc.), AgentVault can issue **scoped, short-lived tokens** instead of raw secrets:

```json
{
  "credential_name": "AWS_ACCESS",
  "token_type": "scoped",
  "value": "ASIA...",
  "expires_at": "2026-02-14T04:30:00Z",
  "scope": "s3:PutObject on arn:aws:s3:::my-bucket/*",
  "session_id": "ses_8f2b"
}
```

The agent gets a token that can only do what it asked for, and it expires automatically.

### Audit Event
Every request generates an immutable audit event:

```json
{
  "event_id": "evt_a1b2c3",
  "timestamp": "2026-02-14T03:31:15Z",
  "agent_id": "agt_cursor_7f3a",
  "credential_name": "AWS_SECRET_ACCESS_KEY",
  "purpose": "Deploy to S3 bucket",
  "decision": "ALLOW",
  "decision_reason": "Profile 'moderate' allows AWS_* with trust >= 50",
  "scope_granted": "s3:PutObject",
  "token_ttl": 3600,
  "session_id": "ses_8f2b",
  "ip": "127.0.0.1"
}
```

---

## API Endpoints

### Authentication

#### `POST /v1/auth/register`
Register a new agent identity.

**Request:**
```json
{
  "agent_name": "my-cursor-agent",
  "framework": "cursor",
  "metadata": {
    "version": "0.45.0",
    "workspace": "/Users/dev/myproject"
  }
}
```

**Response: `201 Created`**
```json
{
  "agent_id": "agt_7f3a9b2c",
  "agent_secret": "avs_sk_live_...",
  "trust_level": 10,
  "profile": "restrictive",
  "message": "New agents start at trust level 10 with restrictive profile. Upgrade via CLI or dashboard."
}
```

#### `POST /v1/auth/token`
Exchange agent credentials for a session token (JWT).

**Request:**
```json
{
  "agent_id": "agt_7f3a9b2c",
  "agent_secret": "avs_sk_live_..."
}
```

**Response: `200 OK`**
```json
{
  "session_token": "eyJhbG...",
  "expires_at": "2026-02-14T04:31:00Z",
  "session_id": "ses_8f2b"
}
```

---

### Credential Operations

#### `POST /v1/credentials/request`
Request access to a credential. This is the core endpoint.

**Headers:** `Authorization: Bearer <session_token>`

**Request:**
```json
{
  "credential_name": "OPENAI_API_KEY",
  "purpose": "Generate code completion",
  "scope": "chat.completions",
  "ttl": 1800
}
```

**Response: `200 OK` (ALLOW)**
```json
{
  "decision": "ALLOW",
  "credential_name": "OPENAI_API_KEY",
  "value": "sk-proj-...",
  "token_type": "raw",
  "expires_at": "2026-02-14T04:01:00Z",
  "session_id": "ses_8f2b",
  "audit_id": "evt_a1b2c3"
}
```

**Response: `200 OK` (REDACT)**
```json
{
  "decision": "REDACT",
  "credential_name": "OPENAI_API_KEY",
  "value": "VAULT_REDACTED_x7f3",
  "reason": "Profile 'moderate' redacts OPENAI_* for trust < 60",
  "audit_id": "evt_d4e5f6"
}
```

**Response: `403 Forbidden` (DENY)**
```json
{
  "decision": "DENY",
  "credential_name": "OPENAI_API_KEY",
  "reason": "Profile 'restrictive' denies all API keys",
  "audit_id": "evt_g7h8i9",
  "upgrade_hint": "Raise trust level to 50+ or switch to 'moderate' profile"
}
```

#### `POST /v1/credentials/batch`
Request multiple credentials at once (for agent startup).

**Request:**
```json
{
  "requests": [
    { "credential_name": "OPENAI_API_KEY", "purpose": "LLM calls" },
    { "credential_name": "DATABASE_URL", "purpose": "Read schema" },
    { "credential_name": "AWS_SECRET_ACCESS_KEY", "purpose": "Deploy" }
  ]
}
```

**Response: `200 OK`**
```json
{
  "results": [
    { "credential_name": "OPENAI_API_KEY", "decision": "ALLOW", "value": "sk-..." },
    { "credential_name": "DATABASE_URL", "decision": "REDACT", "value": "VAULT_REDACTED_db01" },
    { "credential_name": "AWS_SECRET_ACCESS_KEY", "decision": "DENY", "reason": "Trust too low" }
  ],
  "session_id": "ses_8f2b"
}
```

#### `POST /v1/credentials/release`
Explicitly release/return a credential (good citizenship — reduces exposure window).

**Request:**
```json
{
  "credential_name": "OPENAI_API_KEY",
  "session_id": "ses_8f2b"
}
```

---

### Profiles & Policies

#### `GET /v1/profiles`
List available profiles.

#### `GET /v1/profiles/{profile_id}`
Get profile details including all rules.

#### `POST /v1/profiles`
Create a custom profile.

**Request:**
```json
{
  "name": "ci-deploy",
  "description": "CI/CD deployment agent — needs AWS, denies everything else",
  "trust_required": 70,
  "rules": [
    { "pattern": "AWS_*", "action": "allow", "scope": "s3:*,cloudfront:*" },
    { "pattern": "DATABASE_URL", "action": "deny" },
    { "pattern": "*", "action": "deny" }
  ],
  "ttl": 900,
  "max_requests_per_minute": 10
}
```

#### `PUT /v1/profiles/{profile_id}/rules`
Update rules on an existing profile.

---

### Agent Management

#### `GET /v1/agents`
List all registered agents with status.

#### `GET /v1/agents/{agent_id}`
Get agent details, current session, trust level, access history.

#### `PATCH /v1/agents/{agent_id}`
Update agent trust level or profile.

**Request:**
```json
{
  "trust_level": 75,
  "profile": "permissive"
}
```

#### `DELETE /v1/agents/{agent_id}`
Deregister an agent. Revokes all active sessions.

---

### Sessions & Revocation

#### `GET /v1/sessions`
List active sessions.

#### `GET /v1/sessions/{session_id}`
Get session details including all credentials accessed.

#### `DELETE /v1/sessions/{session_id}`
Revoke a specific session. All credentials issued to this session become invalid.

#### `POST /v1/revoke`
**Emergency kill switch.** Revokes ALL active sessions for ALL agents.

**Request:**
```json
{
  "reason": "Suspected credential exfiltration",
  "scope": "all"
}
```

**Response: `200 OK`**
```json
{
  "revoked_sessions": 3,
  "revoked_agents": ["agt_7f3a", "agt_9c2d", "agt_1e4f"],
  "revoked_at": "2026-02-14T03:35:00Z",
  "audit_id": "evt_emergency_001"
}
```

#### `POST /v1/revoke/agent/{agent_id}`
Revoke all sessions for a specific agent.

---

### Audit Trail

#### `GET /v1/audit`
Query audit events with filtering.

**Query params:**
- `agent_id` — filter by agent
- `credential_name` — filter by credential
- `decision` — filter by ALLOW/DENY/REDACT
- `from` / `to` — time range
- `session_id` — filter by session
- `limit` / `offset` — pagination

**Response:**
```json
{
  "events": [
    {
      "event_id": "evt_a1b2c3",
      "timestamp": "2026-02-14T03:31:15Z",
      "agent_id": "agt_7f3a",
      "agent_name": "cursor-main",
      "credential_name": "AWS_SECRET_ACCESS_KEY",
      "decision": "ALLOW",
      "purpose": "Deploy to S3",
      "ip": "127.0.0.1"
    }
  ],
  "total": 47,
  "limit": 20,
  "offset": 0
}
```

#### `GET /v1/audit/stats`
Aggregated statistics for dashboard.

**Response:**
```json
{
  "period": "24h",
  "total_requests": 142,
  "allowed": 98,
  "denied": 31,
  "redacted": 13,
  "unique_agents": 3,
  "unique_credentials": 8,
  "top_denied": [
    { "credential": "DATABASE_URL", "count": 15 },
    { "credential": "AWS_SECRET_ACCESS_KEY", "count": 9 }
  ],
  "anomalies": []
}
```

---

### Health & Status

#### `GET /v1/health`
Health check.

```json
{
  "status": "healthy",
  "version": "0.2.0",
  "uptime_seconds": 86400,
  "active_sessions": 2,
  "vault_status": "unlocked",
  "audit_db": "connected"
}
```

---

## Middleware Pattern

### How Agent Frameworks Integrate

Instead of agents reading env vars directly, they call AgentVault:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   AI Agent   │────▶│  AgentVault  │────▶│   Secret    │
│ (Cursor,     │     │  Middleware   │     │   Store     │
│  Claude Code,│◀────│  (API/SDK)   │◀────│ (local/1pw/ │
│  LangChain)  │     │              │     │  vault/etc) │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Audit Log   │
                    │  + Policy    │
                    │  Engine      │
                    └──────────────┘
```

### Integration Patterns

#### Pattern 1: Environment Proxy (Zero-code)
AgentVault intercepts env var reads at the process level. The agent doesn't know AgentVault exists.
```bash
agentvault wrap -p moderate "claude-code ."
```

#### Pattern 2: SDK Integration (Code-level)
Agent frameworks call AgentVault SDK to get credentials.
```python
from agentvault import AgentVaultClient

vault = AgentVaultClient(agent_name="my-langchain-agent")
api_key = vault.get("OPENAI_API_KEY", purpose="llm-call")
```

#### Pattern 3: MCP Tool (Agent-native)
AgentVault exposes as an MCP server. The AI agent can request credentials through the MCP protocol.
```json
{
  "mcpServers": {
    "agentvault": {
      "command": "agentvault",
      "args": ["mcp-serve", "-p", "moderate"]
    }
  }
}
```

#### Pattern 4: HTTP Middleware (Enterprise)
AgentVault runs as a sidecar/proxy. All outbound API calls from agents route through it.
```
Agent → AgentVault Proxy → Injects auth headers → Upstream API
```
The agent never sees raw credentials. AgentVault injects the right auth based on the destination.

---

## Secret Backend Integrations

AgentVault doesn't replace your secret store — it sits in front of it and adds agent-aware gating.

### Supported Backends

| Backend | Status | Description |
|---------|--------|-------------|
| Local Vault | ✅ v0.1 | AES-256-GCM encrypted local store |
| Environment | ✅ v0.1 | Read from host env vars |
| 1Password | 🔜 v0.3 | Via `op://` URI resolution |
| HashiCorp Vault | 🔜 v0.4 | Via Vault API |
| AWS Secrets Manager | 🔜 v0.4 | Via AWS SDK |
| Doppler | 🔜 v0.5 | Via Doppler API |
| Infisical | 🔜 v0.5 | Via Infisical SDK |
| Azure Key Vault | 🔜 v0.6 | Via Azure SDK |
| GCP Secret Manager | 🔜 v0.6 | Via GCP SDK |

Configuration:
```yaml
# .agentvault/config.yaml
backends:
  - type: local
    priority: 1
  - type: 1password
    priority: 2
    vault: "AI-Agents"
  - type: aws-secrets-manager
    priority: 3
    region: us-east-1
```

---

## Rate Limiting & Abuse Prevention

| Limit | Default | Configurable |
|-------|---------|-------------|
| Requests per minute per agent | 30 | ✅ |
| Concurrent sessions per agent | 3 | ✅ |
| Max credential TTL | 3600s | ✅ |
| Max batch size | 20 | ✅ |
| Failed auth attempts before lockout | 5 | ✅ |
| Lockout duration | 300s | ✅ |

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `AGENT_NOT_REGISTERED` | 401 | Agent ID not found |
| `SESSION_EXPIRED` | 401 | Session token has expired |
| `SESSION_REVOKED` | 401 | Session was revoked (kill switch or manual) |
| `CREDENTIAL_DENIED` | 403 | Profile denies this credential for this agent |
| `TRUST_TOO_LOW` | 403 | Agent trust level below credential threshold |
| `RATE_LIMITED` | 429 | Too many requests |
| `CREDENTIAL_NOT_FOUND` | 404 | Requested credential doesn't exist in any backend |
| `VAULT_LOCKED` | 503 | Vault is locked, needs passphrase |
| `BACKEND_ERROR` | 502 | Secret backend (1Password, AWS, etc.) is unreachable |
