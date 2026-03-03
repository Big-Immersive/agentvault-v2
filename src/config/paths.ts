import path from 'node:path';
import {
  VAULT_DIR, VAULT_FILE, MEMORY_FILE, PROFILES_DIR,
  SESSIONS_FILE, AUDIT_DB, MCP_BUDGET_FILE, PURCHASED_BANKS_DIR,
} from './defaults.js';

/** Resolve all project-relative paths from a single source of truth */
export function resolvePaths(projectDir: string) {
  const base = path.join(projectDir, VAULT_DIR);
  return {
    base,
    vault: path.join(base, VAULT_FILE),
    memory: path.join(base, MEMORY_FILE),
    profiles: path.join(base, PROFILES_DIR),
    sessions: path.join(base, SESSIONS_FILE),
    auditDb: path.join(base, AUDIT_DB),
    passphrase: path.join(base, '.passphrase'),
    mcpBudget: path.join(base, MCP_BUDGET_FILE),
    purchasedBanks: path.join(base, PURCHASED_BANKS_DIR),
  };
}
