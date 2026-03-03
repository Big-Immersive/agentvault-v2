import { Command } from 'commander';
import { loadProfile } from '../profiles/profiles.js';
import { loadVault } from '../vault/vault.js';
import { evaluateEnv } from '../sandbox/evaluateEnv.js';

export function previewCommand(): Command {
  return new Command('preview')
    .description('Preview what env vars an agent would see (dry-run, no side effects)')
    .requiredOption('-p, --profile <name>', 'Permission profile to use')
    .option('--allowed', 'Show only allowed vars')
    .option('--redacted', 'Show only redacted vars')
    .option('--denied', 'Show only denied vars')
    .action((opts) => {
      const dir = process.cwd();
      const profile = loadProfile(dir, opts.profile);

      const allVars: Record<string, string> = { ...process.env as Record<string, string> };
      try {
        for (const entry of loadVault(dir)) {
          allVars[entry.key] = entry.value;
        }
      } catch { /* vault may not exist yet */ }

      const decisions = evaluateEnv(allVars, profile);

      const allowed = decisions.filter(d => d.access === 'allow' || d.access === 'system');
      const redacted = decisions.filter(d => d.access === 'redact');
      const denied = decisions.filter(d => d.access === 'deny');

      console.log(`\nPreview: profile "${profile.name}" (trust: ${profile.trustLevel})\n`);

      const showAllowed = opts.allowed || (!opts.redacted && !opts.denied);
      const showRedacted = opts.redacted || (!opts.allowed && !opts.denied);
      const showDenied = opts.denied || (!opts.allowed && !opts.redacted);

      if (showAllowed && allowed.length) {
        for (const d of allowed) {
          const val = allVars[d.varName];
          const truncated = val && val.length > 60 ? val.slice(0, 57) + '...' : val;
          console.log(`  ALLOW  ${d.varName}=${truncated}`);
        }
      }

      if (showRedacted && redacted.length) {
        for (const d of redacted) {
          console.log(`  REDACT ${d.varName}=VAULT_REDACTED_****`);
        }
      }

      if (showDenied && denied.length) {
        for (const d of denied) {
          console.log(`  DENY   ${d.varName}`);
        }
      }

      console.log(`\nSummary: ${allowed.length} allowed, ${redacted.length} redacted, ${denied.length} denied (${decisions.length} total)\n`);
    });
}
