import crypto from 'node:crypto';
import { loadVault } from '../vault/vault.js';
import { logAccess } from '../audit/audit.js';
import { evaluateEnv } from './evaluateEnv.js';
import type { SandboxOptions } from '../types/index.js';

/** Build a sandboxed environment and log all access decisions */
export function buildSandboxEnv(
  opts: SandboxOptions,
  sessionId: string
): Record<string, string> {
  const env: Record<string, string> = {};
  const allVars: Record<string, string> = { ...process.env as Record<string, string> };

  const vaultEntries = loadVault(opts.projectDir);
  for (const entry of vaultEntries) {
    allVars[entry.key] = entry.value;
  }

  const decisions = evaluateEnv(allVars, opts.profile);
  const timestamp = new Date().toISOString();

  for (const decision of decisions) {
    const value = allVars[decision.varName];

    if (decision.access !== 'system') {
      logAccess(opts.projectDir, {
        sessionId,
        agentId: opts.agentId,
        profileName: opts.profile.name,
        varName: decision.varName,
        action: decision.access,
        timestamp,
      });
    }

    if (decision.access === 'system' || decision.access === 'allow') {
      env[decision.varName] = value;
    } else if (decision.access === 'redact') {
      env[decision.varName] = `VAULT_REDACTED_${crypto.randomBytes(4).toString('hex')}`;
    }
    // deny → excluded
  }

  env['AGENTVAULT_SESSION'] = sessionId;
  env['AGENTVAULT_PROFILE'] = opts.profile.name;
  env['AGENTVAULT_TRUST'] = String(opts.profile.trustLevel);

  return env;
}
