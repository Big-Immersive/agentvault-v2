# AgentVault SDKs

## Overview

AgentVault provides native SDKs for major agent frameworks. Every SDK implements the same core pattern:

1. **Register** — Agent identifies itself to AgentVault
2. **Request** — Agent asks for credentials with purpose + scope
3. **Use** — Agent uses the credential (scoped, time-limited)
4. **Release** — Agent explicitly returns the credential when done

---

## Python SDK

```bash
pip install agentvault
```

### Basic Usage

```python
from agentvault import AgentVault

# Initialize (auto-registers if first run)
vault = AgentVault(
    agent_name="my-research-agent",
    framework="langchain",
    profile="moderate"  # optional, defaults to agent's assigned profile
)

# Request a credential
api_key = vault.get("OPENAI_API_KEY", purpose="Generate embeddings")

# Use it
from openai import OpenAI
client = OpenAI(api_key=api_key)

# Release when done (optional but recommended)
vault.release("OPENAI_API_KEY")

# Context manager pattern (auto-releases)
with vault.credential("DATABASE_URL", purpose="Read schema") as db_url:
    conn = psycopg2.connect(db_url)
    # ... use connection
# credential auto-released here
```

### LangChain Integration

```python
from agentvault.integrations.langchain import AgentVaultCallbackHandler

# Add as a callback — intercepts all credential access
handler = AgentVaultCallbackHandler(
    agent_name="langchain-rag-agent",
    profile="moderate"
)

chain = LLMChain(llm=llm, prompt=prompt, callbacks=[handler])
# AgentVault now gates all credential access within the chain
```

### CrewAI Integration

```python
from agentvault.integrations.crewai import SecureCrewAgent

# Wrap any CrewAI agent with AgentVault gating
agent = SecureCrewAgent(
    role="Researcher",
    goal="Find market data",
    vault_profile="moderate",
    vault_trust=60
)

# Agent's tool calls go through AgentVault for credential access
crew = Crew(agents=[agent], tasks=[task])
crew.kickoff()
```

### AutoGen Integration

```python
from agentvault.integrations.autogen import VaultAssistantAgent

agent = VaultAssistantAgent(
    name="coder",
    vault_profile="moderate",
    llm_config={"model": "gpt-4o"}
)
# All env access from code execution is gated through AgentVault
```

### OpenClaw Integration

```python
from agentvault.integrations.openclaw import VaultMiddleware

# Register as OpenClaw middleware
middleware = VaultMiddleware(profile="moderate")
openclaw.use(middleware)
# All agent sessions now route credentials through AgentVault
```

---

## TypeScript/Node.js SDK

```bash
npm install @agentvault/sdk
```

### Basic Usage

```typescript
import { AgentVault } from '@agentvault/sdk';

const vault = new AgentVault({
  agentName: 'my-node-agent',
  framework: 'custom',
  profile: 'moderate',
});

// Request credential
const apiKey = await vault.get('OPENAI_API_KEY', {
  purpose: 'Generate completions',
});

// Batch request
const creds = await vault.batch([
  { name: 'OPENAI_API_KEY', purpose: 'LLM calls' },
  { name: 'DATABASE_URL', purpose: 'Read data' },
]);
// creds.OPENAI_API_KEY → value or null
// creds.DATABASE_URL → value or null

// Using pattern (auto-release)
await vault.using('DATABASE_URL', { purpose: 'Migration' }, async (dbUrl) => {
  await runMigrations(dbUrl);
});

// Release
await vault.release('OPENAI_API_KEY');

// Emergency revoke
await vault.revokeAll('Suspected breach');
```

### Express/Fastify Middleware (for agent API servers)

```typescript
import { agentVaultMiddleware } from '@agentvault/sdk/middleware';

app.use(agentVaultMiddleware({
  profile: 'moderate',
  // Injects gated credentials into req.vault
}));

app.get('/api/data', async (req, res) => {
  const dbUrl = await req.vault.get('DATABASE_URL', { purpose: 'API query' });
  // ...
});
```

---

## Go SDK

```bash
go get github.com/agentvault/agentvault-go
```

```go
package main

import (
    vault "github.com/agentvault/agentvault-go"
)

func main() {
    v, _ := vault.New(vault.Config{
        AgentName: "my-go-agent",
        Framework: "custom",
        Profile:   "moderate",
    })
    defer v.Close()

    apiKey, err := v.Get("OPENAI_API_KEY", vault.Purpose("API calls"))
    if err != nil {
        if vault.IsDenied(err) {
            log.Printf("Credential denied: %s", err)
        }
    }
    defer v.Release("OPENAI_API_KEY")
}
```

---

## MCP Server Mode

AgentVault can expose itself as an MCP (Model Context Protocol) server. AI agents call AgentVault as a tool to request credentials.

### Configuration

```json
{
  "mcpServers": {
    "agentvault": {
      "command": "agentvault",
      "args": ["mcp-serve", "--profile", "moderate", "--trust", "50"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `get_credential` | Request a single credential with purpose |
| `list_available` | List credentials the agent CAN access (based on profile) |
| `release_credential` | Release a credential |
| `check_trust` | Check current trust level and profile |
| `audit_self` | View own access history |

### Example Agent Interaction

```
Agent: I need to deploy to AWS. Let me check my credentials.
→ Calls: get_credential(name="AWS_ACCESS_KEY_ID", purpose="S3 deployment")
← AgentVault: ALLOW — here's a scoped token valid for 30 minutes, S3 only.

Agent: I also need the database URL to run migrations.
→ Calls: get_credential(name="DATABASE_URL", purpose="Run migrations")
← AgentVault: DENY — your trust level (50) is below the required 80 for DATABASE_URL.
   Hint: Ask the developer to raise your trust level.
```

---

## Webhook Notifications

Subscribe to real-time events:

```yaml
# .agentvault/config.yaml
webhooks:
  - url: https://hooks.slack.com/services/xxx
    events: [credential.denied, session.revoked, anomaly.detected]
  - url: http://localhost:8080/agentvault-events
    events: [credential.allowed, credential.denied]
    headers:
      Authorization: "Bearer my-webhook-secret"
```

### Event Payload

```json
{
  "event": "credential.denied",
  "timestamp": "2026-02-14T03:31:15Z",
  "agent_id": "agt_7f3a",
  "agent_name": "cursor-main",
  "credential_name": "DATABASE_URL",
  "reason": "Trust level 50 below required 80",
  "session_id": "ses_8f2b"
}
```

---

## Enterprise: Sidecar Proxy Mode

For enterprise deployments, AgentVault runs as a sidecar proxy that intercepts all outbound HTTP traffic from agents and injects authentication:

```
Agent (no credentials) → AgentVault Proxy → Adds auth headers → Upstream API
```

### How It Works

1. Agent makes HTTP requests to upstream APIs **without** auth headers
2. AgentVault proxy intercepts the request
3. Checks the destination against the agent's profile
4. Injects the appropriate auth header (Bearer token, API key, etc.)
5. Forwards to upstream
6. Logs the access in audit trail

### Configuration

```yaml
# .agentvault/proxy.yaml
proxy:
  listen: 127.0.0.1:6200
  rules:
    - destination: "api.openai.com"
      credential: "OPENAI_API_KEY"
      header: "Authorization"
      format: "Bearer {value}"
    - destination: "api.github.com"
      credential: "GITHUB_TOKEN"
      header: "Authorization"
      format: "Bearer {value}"
    - destination: "*.amazonaws.com"
      credential: "AWS_ACCESS"
      auth_type: "aws-sigv4"
```

### Agent Configuration

```bash
# Set HTTP proxy for the agent process
export HTTP_PROXY=http://127.0.0.1:6200
export HTTPS_PROXY=http://127.0.0.1:6200
agentvault wrap -p moderate --proxy "claude-code ."
```

The agent has **zero credentials in its environment** — AgentVault proxy handles all auth transparently.
