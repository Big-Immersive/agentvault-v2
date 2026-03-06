# Plan: Port v1 Website + Missing CLI Commands to v2

## Context

AgentVault v2 has all the advanced features (memory, MCP, marketplace, wallet) but is missing the marketing website and 3 CLI commands that exist in v1 (`/Users/mna036/ai-bytes/agentvault/`). The user wants to port these into v2 and update the website content to showcase v2 features.

---

## Gap Summary

| Gap | Source (v1) | Priority |
|-----|-------------|----------|
| Website (Next.js marketing + docs + ACSS spec) | `website/` | Must-have |
| `rotate` command (passphrase rotation) | `apps/cli/src/commands/rotate.ts` | Must-have |
| `watch` command (live audit tail) | `apps/cli/src/commands/watch.ts` | Must-have |
| `secret rename` subcommand (CLI wiring only) | `apps/cli/src/commands/secret.ts` | Must-have |
| Agent Skills definition | `skills/agentvault/` | Nice-to-have |
| ACSS v1.0 spec + schemas | `spec/` | Nice-to-have |
| Strategic docs (launch-plan, ROADMAP, BRANDING, GTM) | `docs/`, root | Nice-to-have |
| LICENSE (MIT) | root | Nice-to-have |
| .npmignore | root | Nice-to-have |

---

## Part 1: Website (20 files)

### Approach
Copy the entire v1 `website/` directory into v2 root, then update content for v2 features.

### Files to copy as-is (no changes)
```
website/
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── Dockerfile
├── public/logo.svg, logo-icon.svg, favicon.svg
├── src/app/globals.css
├── src/app/acss/page.tsx          (ACSS spec viewer)
├── src/hooks/useInView.ts
├── src/hooks/useScrollSpread.ts
├── src/components/Problem.tsx
├── src/components/APISection.tsx
├── src/components/CTA.tsx
```

### Files to copy + modify

**`website/package.json`** — Update name to `agentvault-v2-website`

**`website/src/app/layout.tsx`** — Update metadata title/description to mention Memory, MCP, Marketplace

**`website/src/components/Hero.tsx`** — Update `TERMINAL_LINES` array to show memory + MCP commands:
```
$ agentvault init → ✓ initialized
$ agentvault secret add OPENAI_KEY "sk-..." → ✓ encrypted
$ agentvault memory store api-patterns "Use retry..." → ✓ stored (3 keywords)
$ agentvault mcp start → ⚡ MCP server listening (11 tools)
```

**`website/src/components/Features.tsx`** — Expand from 6 to 9 features. Add:
- Agent Memory (keyword search, TTL, confidence scoring)
- MCP Server (11 tools, rate-limited, budget-tracked)
- Memory Marketplace (package, publish, license enforcement)

**`website/src/components/HowItWorks.tsx`** — Expand from 3 to 4 steps. Add "Remember & Learn" step for memory.

**`website/src/components/UseCases.tsx`** — Add 2 use cases (total 6):
- AI Memory Persistence
- MCP Integration

**`website/src/components/Comparison.tsx`** — Add 4 rows:
- Agent Memory Store, MCP Server, Memory Marketplace, Portable Vault Export

**`website/src/components/Navbar.tsx`** — Update GitHub URL to v2 repo

**`website/src/components/Footer.tsx`** — Update GitHub URL, add Memory/Marketplace links

**`website/src/app/documentation/page.tsx`** — Major content additions:
- Add sidebar sections: Memory System, MCP Server, Marketplace, Portable Vault
- Add CommandDoc entries for all v2 commands: memory store/query/list/remove/export/import, memory package, mcp start, vault export/import, wallet, gateway, publish, discover, checkout, rotate, watch
- Update Quick Reference table with all v2 commands

**`website/src/app/page.tsx`** — No structural changes needed (just renders components)

---

## Part 2: CLI Commands (5 files modified/created)

### 2.1 `rotate` command — NEW file

**File:** `src/commands/rotate.ts`

Port from v1 `apps/cli/src/commands/rotate.ts` with these adaptations:

1. Import v2 modules: `resolvePaths`, `loadVault`, `saveVault`, `loadMemories`, `saveMemories`, `_clearPassphraseCache`
2. Add `--dry-run` flag (v2 convention)
3. **Re-encrypt BOTH vault.json AND memory.json** (v1 only had vault)
4. Critical sequence:
   ```
   Load vault + memory with current passphrase
   → Prompt for new passphrase (min 8 chars + confirm)
   → Write new passphrase to .agentvault/.passphrase (0o600)
   → _clearPassphraseCache()  ← CRITICAL: must clear before re-encrypt
   → saveVault(dir, vaultEntries)
   → saveMemories(dir, memoryEntries)
   ```

Key functions already exist in v2:
- `_clearPassphraseCache()` — `src/vault/encryption.ts:24`
- `loadVault()` / `saveVault()` — `src/vault/vault.ts:50,57`
- `loadMemories()` / `saveMemories()` — `src/memory/memory.ts:49,56`
- `resolvePaths()` — `src/config/paths.ts`

### 2.2 `watch` command — NEW file

**File:** `src/commands/watch.ts`

Nearly direct port from v1 `apps/cli/src/commands/watch.ts`:
- Import `queryAudit` from `../audit/audit.js` (same API as v1)
- `-i, --interval <ms>` option (default 1000)
- setInterval polling, tracks `lastId` for new-only display
- Color-coded: green=allow, amber=redact, red=deny
- SIGINT handler for graceful exit

No functional changes needed — v2's `queryAudit` has identical signature.

### 2.3 `secret rename` subcommand — MODIFY existing file

**File:** `src/commands/secret.ts`

`renameSecret()` already exists in `src/vault/vault.ts:114-129`. Only the CLI wiring is missing.

Changes:
1. Add `renameSecret` to import on line 3
2. Add subcommand before `return cmd`:
   ```typescript
   cmd.command('rename <oldKey> <newKey>')
     .description('Rename a secret key')
     .action((oldKey, newKey) => {
       const renamed = renameSecret(process.cwd(), oldKey, newKey);
       if (renamed) console.log(`Renamed "${oldKey}" to "${newKey}"`);
       else console.log(`Secret "${oldKey}" not found.`);
     });
   ```

### 2.4 Register new commands — MODIFY

**File:** `src/index.ts`

Add after line 59 (after `wrapCommand`):
```typescript
import { rotateCommand } from './commands/rotate.js';
import { watchCommand } from './commands/watch.js';
// ...
program.addCommand(rotateCommand());
program.addCommand(watchCommand());
```

---

## Part 3: Nice-to-haves (copy from v1)

### 3.1 Agent Skills
Copy `skills/agentvault/` directory (SKILL.md + references/commands.md). Update command references for v2 commands.

### 3.2 ACSS Spec
Copy `spec/` directory (acss-v1.0.md + schema/ + examples/).

### 3.3 Root files
- Copy `LICENSE` (MIT)
- Copy `.npmignore`
- Copy strategic docs to `docs/`: launch-plan.md, ROADMAP.md, BRANDING.md, GTM.md

---

## Part 4: Tests

### Unit test for rotate
**File:** `tests/unit/rotate.test.ts` (NEW)
- Test: re-encrypt vault with new passphrase (old fails, new works)
- Test: re-encrypt memory with new passphrase
- Test: dry-run doesn't modify anything

### Integration tests
**File:** `tests/integration/cli.test.ts` (MODIFY)
- Test: `secret rename` works
- Test: `secret rename` non-existent key returns "not found"

---

## Verification

```bash
# Build check
npx tsc --noEmit

# Run all tests
npx vitest run

# Test new commands manually
AGENTVAULT_PASSPHRASE=test123456 npx tsx src/index.ts secret add MY_KEY my-value
AGENTVAULT_PASSPHRASE=test123456 npx tsx src/index.ts secret rename MY_KEY NEW_KEY
AGENTVAULT_PASSPHRASE=test123456 npx tsx src/index.ts secret get NEW_KEY

# Test watch (Ctrl+C to exit)
AGENTVAULT_PASSPHRASE=test123456 npx tsx src/index.ts watch

# Test rotate (interactive)
AGENTVAULT_PASSPHRASE=test123456 npx tsx src/index.ts rotate --dry-run

# Website
cd website && pnpm install && pnpm dev
# Visit http://localhost:3000
```

---

## Implementation Order

1. **CLI commands first** (small, testable independently)
   - `secret rename` (5 min — just CLI wiring)
   - `watch` command (10 min — direct port)
   - `rotate` command (15 min — needs memory re-encryption)
   - Register in index.ts
   - Tests

2. **Website** (larger scope, independent)
   - Copy entire v1 `website/` directory
   - Apply content updates for v2 features
   - Verify with `pnpm dev`

3. **Nice-to-haves** (if time permits)
   - Agent Skills, ACSS spec, LICENSE, .npmignore, strategic docs
