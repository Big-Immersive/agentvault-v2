# Plan: Export/Import Sanitization for Memory & Vault

## Context
Memory and vault exports currently pass all fields through without checking for sensitive data. API keys, tokens, emails, credit cards, SSH keys, and passwords stored in memory entries could leak via plaintext or even encrypted exports (if passphrase is shared). We need an always-on sanitization layer that detects and redacts sensitive patterns before any export, with `--no-sanitize` to opt out.

## Design Decisions
- **Always-on**: Sanitization runs on every export (plain + encrypted). Use `--no-sanitize` to skip.
- **Redaction style**: `[REDACTED:pattern_type]` labels (e.g., `[REDACTED:api_key]`, `[REDACTED:email]`)
- **Patterns detected**: API keys/tokens, emails, URLs with credentials, credit cards, SSH keys, passwords in key=value format
- **Import validation**: Reject entries with invalid schema; warn on entries containing redaction labels

## Files to Create

### `src/memory/sanitize.ts` (NEW — ~150 LOC)
Core sanitization module:

```typescript
// Types
interface SanitizeResult {
  sanitized: string;
  redactions: { type: string; count: number }[];
}

// Pattern registry — ordered list of { name, regex, label }
const SENSITIVE_PATTERNS = [
  { name: 'api_key',     regex: /(api[_-]?key|token|secret|bearer|x-api-key|authorization)\s*[:=]\s*\S+/gi, label: '[REDACTED:api_key]' },
  { name: 'password',    regex: /(password|passwd|pwd)\s*[:=]\s*\S+/gi, label: '[REDACTED:password]' },
  { name: 'ssh_key',     regex: /(-----BEGIN [A-Z ]+-----|ssh-(rsa|ed25519|dss)\s+\S+)/g, label: '[REDACTED:ssh_key]' },
  { name: 'credit_card', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, label: '[REDACTED:credit_card]' },
  { name: 'email',       regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: '[REDACTED:email]' },
  { name: 'url_creds',   regex: /https?:\/\/[^:]+:[^@]+@\S+/g, label: '[REDACTED:url_credentials]' },
];

// Functions
export function sanitizeContent(text: string): SanitizeResult { ... }
export function sanitizeMemoryEntry(entry: MemoryEntry): { entry: MemoryEntry; redactions: ... } { ... }
export function sanitizeMemoryEntries(entries: MemoryEntry[]): { entries: MemoryEntry[]; summary: ... } { ... }
export function hasRedactionLabels(text: string): boolean { ... }  // For import warnings
```

**Fields sanitized per entry:**
- `content` — full pattern scan + redact
- `source` — scan for URL credentials
- `keywords` — re-extract from sanitized content (reuse `extractKeywords` from `src/memory/search.ts`)

**Fields left untouched:** `key`, `tags`, `queryHash`, `confidence`, `expiresAt`, `accessCount`, `addedAt`, `memoryType`, `vaultType`

## Files to Modify

### `src/commands/memory.ts`
- **Export subcommand** (~10 lines changed):
  - Add `--no-sanitize` flag (default: sanitize ON)
  - Call `sanitizeMemoryEntries()` before writing/encrypting
  - Print summary: "Redacted X items across Y entries" to stderr
- **Import subcommand** (~5 lines changed):
  - After decryption/parsing, check entries for `[REDACTED:...]` labels
  - Warn user: "N entries contain redaction labels — these may have been sanitized"

### `src/portable/portable.ts` (~5 lines changed)
- `exportMemoryPortable()` — accept optional `sanitize: boolean` param, apply sanitization before encryption
- `exportPortable()` — same for full vault export with memories

### `src/memory/memory.ts` (~5 lines changed)
- Add `exportMemoriesSanitized()` convenience wrapper that calls `exportMemories()` + `sanitizeMemoryEntries()`

### `src/types/index.ts` (~10 lines added)
- Add `SanitizeResult`, `RedactionSummary` types

## Files to Create (Tests)

### `tests/unit/sanitize.test.ts` (NEW — ~200 LOC)
Test cases:
1. Detects and redacts API key patterns (`api_key=sk-abc123`)
2. Detects and redacts bearer tokens (`Authorization: Bearer xyz`)
3. Detects and redacts email addresses
4. Detects and redacts credit card numbers (with/without dashes)
5. Detects and redacts SSH keys
6. Detects and redacts URL credentials (`https://user:pass@host`)
7. Detects and redacts password fields
8. Preserves non-sensitive content unchanged
9. Handles empty/null content
10. Re-extracts keywords from sanitized content
11. `hasRedactionLabels()` detects `[REDACTED:...]` in imported data
12. Multiple patterns in single content string
13. CJK/Arabic content preserved during sanitization

## MCP Server Impact
- `vault_export` tool — will automatically use sanitized export (always-on)
- `vault_memory_query` / `vault_memory_list` — NO change (reads from encrypted store, not exporting)
- `vault_memory_store` — NO change (storing is user's intent)

## Verification
1. `npx vitest run tests/unit/sanitize.test.ts` — all sanitize tests pass
2. `npx vitest run` — full suite passes (no regressions)
3. Manual test via CLI:
   ```bash
   # Store entry with sensitive data
   agentvault memory store --key test-secret --content "my api_key=sk-live-abc123 and email test@example.com"

   # Export plaintext — should see redactions
   agentvault memory export | grep REDACTED

   # Export with --no-sanitize — should see raw data
   agentvault memory export --no-sanitize

   # Export encrypted — should redact before encrypting
   agentvault memory export --encrypt --passphrase test --output test.avault
   ```
4. MCP tool test: call `vault_export` and verify output is sanitized
