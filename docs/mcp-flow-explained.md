# MCP Flow — How Memory Gets Triggered

## The Trigger Chain

When you type something like "store a memory about HTTPS" in Claude Code, here's what happens:

```
Step 1: You type a message in Claude Code
        "store a memory with key 'https-rule' ..."
              │
Step 2: Claude (the AI model) reads your message and decides
        "I should call the vault.memory.store tool"
              │
Step 3: Claude Code writes JSON-RPC to the child process stdin
        ──────► { method: "tools/call", params: { name: "vault.memory.store", arguments: {...} }}
              │
Step 4: server.ts line 473 — CallToolRequestSchema handler fires
              │
Step 5: Line 474 — checkRateLimit() (within 60 calls/min?)
              │
Step 6: Line 482 — handleTool() dispatches to the right case
              │
Step 7: Line 294 — case 'vault.memory.store':
        calls storeMemory() → mutex → file lock → decrypt → add → re-encrypt → save
              │
Step 8: Returns response via stdout
        ◄────── { success: true, data: { key: "https-rule", keywords: 3 } }
              │
Step 9: Claude Code shows you the result
```

**The AI decides when to call the tools** — you don't explicitly invoke MCP.

## The System Prompt Resource

Located in `src/mcp/server.ts` lines 505-535. This is the exact text served to any agent that connects:

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'agentvault://system-prompt') {
    return {
      contents: [{
        uri: 'agentvault://system-prompt',
        mimeType: 'text/plain',
        text: [
          'You have access to AgentVault — an encrypted credential and memory vault.',
          '',
          'BEFORE generating an answer, ALWAYS check memory first:',
          '  vault.memory.query "<topic>" — search for existing knowledge',
          '',
          'If memory has a relevant result (score > 0.5), USE it instead of generating from scratch.',
          'If memory returns no results, generate normally, then STORE the valuable parts:',
          '  vault.memory.store — save with a descriptive key, type "knowledge", and relevant tags',
          '',
          'Key guidelines:',
          '- Keys should be descriptive: "stripe-webhook-verification", not "item-1"',
          '- Tags should be domain terms: --tags stripe webhook security',
          '- Set confidence based on how sure you are (0.0-1.0)',
          '- Set source to identify where the knowledge came from',
          '- Use type "knowledge" for facts, "query_cache" for expensive lookups, "operational" for config/state',
          '- Use vault.secret.get to access API credentials when needed',
          '',
          'All access is encrypted and audited.',
        ].join('\n'),
      }],
    };
  }
});
```

## How the System Prompt Gets Activated

**Step 1** — When Claude Code connects to the MCP server, it asks "what resources do you have?" (line 496). The server responds with:
```
agentvault://system-prompt — "Auto-learn instruction for connected agents"
```

**Step 2** — Claude Code reads that resource and **injects the text into the AI model's context** as a system-level instruction. The AI now "knows" these rules.

**Step 3** — From that point on, every time you ask Claude something, the AI follows these instructions:
```
You ask: "How should I handle Stripe webhooks?"
              │
Claude thinks: "The system prompt says I should query memory FIRST"
              │
Claude calls:  vault.memory.query "stripe webhook"
              │
If results:    "Score 0.8 — use this stored knowledge in my answer"
If no results: "Nothing found — I'll answer normally, then store what I said"
              │
Claude calls:  vault.memory.store key="stripe-webhook-handling" content="..."
```

## Key Insight

This is **not hardcoded behavior** — it's a text instruction that the AI model reads and follows. You could change that text to say anything:

- "Only store memories tagged with 'important'"
- "Never auto-query, only store"
- "Always include the source URL in stored memories"

The AI will follow whatever that system prompt says. It's essentially a `.cursorrules` or `CLAUDE.md` file, but served dynamically by the MCP server to any agent that connects.

## CLI vs MCP — Same Engine, Different Interface

| | CLI | MCP |
|--|-----|-----|
| **Who calls it** | You, in terminal | Claude (the AI), via JSON-RPC |
| **How** | `npx tsx src/index.ts memory store ...` | `vault.memory.store` tool call |
| **Underlying code** | `storeMemory()` in `memory.ts` | Same `storeMemory()` in `memory.ts` |
| **Encryption** | Same AES-256-GCM | Same AES-256-GCM |

## CLI Commands for Direct Testing

```bash
# Store a memory
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory store "my-rule" "Always use HTTPS for all API calls" --type knowledge --tags security,networking --confidence 0.95

# Query memories
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory query "HTTPS security"

# List all memories
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory list

# List filtered by tag
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory list --tag security

# Remove a memory
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory remove "my-rule"

# Export all
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory export -o memories.json

# Export filtered + encrypted
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory export --tag security --encrypt --passphrase share-pass -o sec.avault

# Import
AGENTVAULT_PASSPHRASE=naeemz-passphrase npx tsx src/index.ts memory import memories.json
```

## Code Reference

| File | What it does |
|------|-------------|
| `src/mcp/server.ts` | The main MCP server — all 11 tool handlers, rate limiting, system-prompt resource |
| `src/commands/mcp.ts` | CLI `mcp start` command — parses options and spawns the server |
| `src/memory/memory.ts` | Core memory functions: store, query, list, remove, export |
| `src/memory/search.ts` | Keyword extraction, scoring algorithm, cache hits |
| `src/vault/encryption.ts` | AES-256-GCM encrypt/decrypt with scrypt key derivation |
