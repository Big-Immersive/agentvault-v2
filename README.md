# AgentVault

Encrypted agent credential and memory vault with MCP server.

## Features

- **Encrypted Vault** — AES-256-GCM with scrypt key derivation, random salt per file
- **Memory Store** — Keyword-indexed memory with search ranking, freshness scoring, and TTL
- **MCP Server** — Model Context Protocol server (stdio + SSE) with 11 tools
- **Profile System** — Granular permission profiles for agent sandboxing
- **Audit Trail** — SQLite-backed audit log of all credential access
- **Portable Export** — Self-contained `.avault` files for vault portability
- **License Enforcement** — Access control for purchased memory banks

## Quick Start

```bash
npm install
agentvault init
agentvault secret add API_KEY "sk-..."
agentvault memory store my-fact "Important context about the project" -t fact --tags project
agentvault memory query "project context"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize AgentVault in current project |
| `secret add/get/list/remove/import` | Manage vault secrets |
| `profile list/show/create/delete/clone` | Manage permission profiles |
| `audit show/export/clear` | View credential access audit logs |
| `revoke` | Revoke agent sessions (kill switch) |
| `status` | Show AgentVault status |
| `preview -p <profile>` | Preview env var access for a profile |
| `doctor` | Health check for vault integrity |
| `diff <profileA> <profileB>` | Compare two profiles |
| `wrap -p <profile> <command>` | Run command in sandboxed environment |
| `memory store/query/list/remove/export` | Manage agent memory |
| `memory package` | Package memories into purchasable bank |
| `vault export/import` | Portable vault export/import |
| `mcp start` | Start MCP server |

## MCP Server

Start the MCP server for agent integration:

```bash
# stdio transport (for Claude, Cursor, etc.)
agentvault mcp start

# SSE transport
agentvault mcp start --transport sse --port 3100
```

### MCP Tools

- `vault.secret.get` / `vault.secret.list` — Credential access
- `vault.memory.store` / `vault.memory.query` / `vault.memory.list` / `vault.memory.remove` — Memory management
- `vault.audit.show` — Audit trail
- `vault.status` / `vault.profile.show` / `vault.preview` — Status and configuration
- `vault.export` — Portable export

## Security

- AES-256-GCM encryption with random salt per file
- scrypt key derivation (N:16384, r:8, p:1)
- No default passphrase — must be explicitly configured
- File locking via proper-lockfile for cross-process safety
- In-process AsyncMutex for concurrent access serialization
- Rate limiting (60 calls/min) on MCP server
- SSE auth via `AGENTVAULT_MCP_TOKEN` bearer token

## Configuration

Set passphrase via (in priority order):
1. `AGENTVAULT_PASSPHRASE` environment variable
2. `.agentvault/.passphrase` file
3. Interactive prompt during `init`

## Development

```bash
npm install
npm run build       # Compile TypeScript
npm test            # Run all tests
npm run test:watch  # Watch mode
```

## License

MIT
