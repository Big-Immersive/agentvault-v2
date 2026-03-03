# CLAUDE.md — AgentVault Build Instructions

You are building AgentVault v1 — an encrypted agent credential and memory vault with MCP server.

## Architecture

Single npm package. TypeScript. Node 20+. No monorepo split.

```
agentvault-v2/
├── src/
│   ├── types/index.ts          # All type definitions
│   ├── config/
│   │   ├── defaults.ts         # Constants, stopwords
│   │   └── paths.ts            # Path resolution
│   ├── vault/
│   │   ├── vault.ts            # Credential vault (AES-256-GCM, random salt)
│   │   └── encryption.ts       # Shared encrypt/decrypt with scrypt
│   ├── memory/
│   │   ├── memory.ts           # Memory store/query/list/remove/export
│   │   ├── search.ts           # Keyword extraction, ranking, freshness
│   │   └── mutex.ts            # AsyncMutex for in-process concurrency
│   ├── profiles/
│   │   ├── profiles.ts         # Load/save YAML profiles
│   │   └── matchRule.ts        # Glob pattern matching
│   ├── audit/
│   │   └── audit.ts            # SQLite audit trail
│   ├── sessions/
│   │   └── sessions.ts         # Active session tracking
│   ├── sandbox/
│   │   ├── buildEnv.ts         # Environment variable filtering
│   │   ├── evaluateEnv.ts      # Rule evaluation
│   │   └── runSandboxed.ts     # Spawn sandboxed process
│   ├── mcp/
│   │   └── server.ts           # MCP server (stdio + SSE)
│   ├── portable/
│   │   └── portable.ts         # Portable vault format (.avault)
│   ├── license/
│   │   └── license.ts          # License enforcement for purchased banks
│   ├── commands/
│   │   ├── init.ts
│   │   ├── secret.ts
│   │   ├── profile.ts
│   │   ├── audit.ts
│   │   ├── revoke.ts
│   │   ├── status.ts
│   │   ├── preview.ts
│   │   ├── doctor.ts
│   │   ├── diff.ts
│   │   ├── wrap.ts
│   │   ├── memory.ts           # store/query/list/remove/export subcommands
│   │   ├── memoryPackage.ts    # memory package --from-tag X --name Y --price Z
│   │   ├── vault.ts            # vault export/import
│   │   └── mcp.ts              # mcp start
│   └── index.ts                # CLI entry (commander)
├── tests/
│   ├── unit/
│   │   ├── encryption.test.ts
│   │   ├── memory.test.ts
│   │   ├── search.test.ts
│   │   ├── vault.test.ts
│   │   ├── license.test.ts
│   │   ├── portable.test.ts
│   │   └── mutex.test.ts
│   └── integration/
│       ├── cli.test.ts
│       └── mcp.test.ts
├── profiles/                   # Default profile templates
│   ├── restrictive.yml
│   ├── moderate.yml
│   └── permissive.yml
├── spec/                       # ACSS v2.0 spec (later)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Key Technical Requirements

### Encryption (src/vault/encryption.ts)
- AES-256-GCM with scrypt key derivation (N:16384, r:8, p:1, output:32 bytes)
- RANDOM salt per file (generated on creation, stored in encrypted envelope)
- NOT hardcoded salt. Each vault.json and memory.json gets its own random salt.
- Encrypted JSON format: `{ salt: hex, iv: hex, tag: hex, data: hex }`
- Passphrase from: AGENTVAULT_PASSPHRASE env > .agentvault/.passphrase file > interactive prompt (no default)

### Vault (src/vault/vault.ts)
- Stores VaultEntry[] in vault.json (encrypted)
- Max 1,000 entries / 10MB. Warning at 80%.
- File locking via proper-lockfile for cross-process safety

### Memory (src/memory/memory.ts)
- Stores MemoryEntry[] in memory.json (encrypted)
- Max 10,000 entries / 50MB. Warning at 80%.
- Each entry has: key, vaultType:'memory', memoryType, tags:string[], queryHash?, keywords:string[], content, confidence(0-1), source?, expiresAt?, accessCount, addedAt

### Memory Search (src/memory/search.ts)
- extractKeywords(content): lowercase, split on whitespace+punct, filter ≥3 chars, drop stopwords, dedupe, max 20
- Search algorithm:
  1. Exact cache hit: SHA-256 hash match (O(1))
  2. Keyword ranking: score = matchRatio × confidence × freshnessMultiplier × recencyBoost
     - matchRatio = matchingKeywords / queryTokens.length
     - freshness = max(0, 1 - ageHours/ttlHours) — 1.0 if no TTL
     - recencyBoost = 1 + (0.1 × min(accessCount, 10) / 10) — max 1.1
  3. Min score threshold: 0.1. Ties broken by addedAt desc (newer wins)
- No partial matching. "web" does NOT match "webhook".
- queryHash collision: same key = overwrite, different key + same hash = allowed

### AsyncMutex (src/memory/mutex.ts)
- In-process async mutex. One per file (vaultMutex, memoryMutex).
- All read-modify-write cycles: acquire mutex FIRST, then file lock. Never reversed.

### CLI (src/index.ts) — 14 commands via commander
1. init, 2. wrap, 3. secret (add/get/list/remove/import), 4. profile (list/show/create/delete/clone),
5. audit (show/export/clear), 6. revoke, 7. status, 8. preview, 9. doctor, 10. diff,
11. memory (store/query/list/remove/export), 12. memory package, 13. mcp start, 14. vault (export/import)

### --dry-run on ALL destructive ops
- secret remove, memory remove, audit clear, revoke
- vault export --decrypted requires --confirm-plaintext, output 0600

### MCP Server (src/mcp/server.ts)
- Transport: stdio (primary) + SSE (secondary)
- 11 tools: vault.secret.get, vault.secret.list, vault.memory.store, vault.memory.query,
  vault.memory.list, vault.memory.remove, vault.audit.show, vault.status, vault.profile.show,
  vault.preview, vault.export
- Error contract: { success: true, data } or { success: false, error: string, code: string }
- 11 error codes: KEY_NOT_FOUND, VAULT_LOCKED, VAULT_FULL, BUDGET_EXCEEDED, RATE_LIMITED,
  UNAUTHORIZED, INVALID_INPUT, DECRYPTION_FAILED, INTERNAL_ERROR, LICENSE_EXPIRED, ACCESS_LIMIT_REACHED
- Rate limit: 60 calls/min
- Budget: persisted to mcp-budget.json with PID lock
- Signal handling: SIGTERM/SIGINT → drain 5s → flush budget → release locks → exit
- SSE auth: AGENTVAULT_MCP_TOKEN env var, validated per-connection
- System prompt resource: auto-learn instruction injected when agent connects

### License Enforcement (src/license/license.ts)
- Purchased banks in .agentvault/purchased-banks/{name}/ (license.json + bank.encrypted + descriptor.json)
- 5 access types: unlimited, time_locked, access_limited, time_and_access, subscription
- License checked before serving purchased bank query results
- Decrements remainingAccesses on each access

### Portable Vault Format (src/portable/portable.ts)
- Schema: agentvault-portable/1.0
- .avault file extension
- Encrypted with passphrase provided at export time (independent of vault key)
- Self-contained: any compliant tool can decrypt and parse

## Dependencies
- commander (CLI)
- better-sqlite3 (audit)
- proper-lockfile (file locking)
- js-yaml (profiles)
- vitest (testing)
- @modelcontextprotocol/sdk (MCP server)

## Reference Code
The existing inflectiv-agentvault repo at ~/clawd/projects/inflectiv-agentvault/ has working implementations of:
- vault.ts (encryption — but uses hardcoded salt, needs random salt)
- audit.ts (SQLite)
- profiles.ts, matchRule.ts
- sessions.ts
- sandbox/ (buildEnv, evaluateEnv, runSandboxed)
- All CLI commands except memory, mcp, vault export/import

Cherry-pick and improve from that repo. Do NOT copy the hardcoded salt pattern.

## Build Order (do this in sequence)
1. package.json + tsconfig.json + vitest.config.ts
2. src/types/index.ts (ALL types)
3. src/config/ (defaults + paths)
4. src/vault/encryption.ts (shared encrypt/decrypt with random salt)
5. src/vault/vault.ts (credential vault using encryption.ts)
6. src/memory/mutex.ts
7. src/memory/search.ts (extractKeywords + search algorithm + freshness)
8. src/memory/memory.ts (store/query/list/remove/export)
9. src/profiles/ (copy from reference, adapt imports)
10. src/audit/audit.ts (copy from reference, adapt imports)
11. src/sessions/sessions.ts (copy from reference)
12. src/sandbox/ (copy from reference)
13. src/license/license.ts
14. src/portable/portable.ts
15. src/commands/ (all 14 commands)
16. src/index.ts (CLI entry)
17. src/mcp/server.ts
18. tests/ (unit + integration)
19. profiles/ (default YAML files)
20. README.md

## Testing
- Use vitest
- Every module must have tests
- Run: npx vitest run
- Test encryption roundtrip, memory CRUD, search ranking, mutex concurrency, license enforcement, portable export/import

## Quality
- TypeScript strict mode
- No any types
- All functions documented with JSDoc
- Clean build: npx tsc --noEmit
