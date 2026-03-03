import { Command } from 'commander';
import fs from 'node:fs';
import { resolvePaths } from '../config/paths.js';
import { getActiveSessions } from '../sessions/sessions.js';
import { listProfiles } from '../profiles/profiles.js';
import { listSecretKeys } from '../vault/vault.js';

export function statusCommand(): Command {
  return new Command('status')
    .description('Show AgentVault status')
    .action(() => {
      const dir = process.cwd();
      const paths = resolvePaths(dir);

      if (!fs.existsSync(paths.base)) {
        console.log('AgentVault not initialized. Run `agentvault init`.');
        return;
      }

      const profiles = listProfiles(dir);
      let secretCount = 0;
      try { secretCount = listSecretKeys(dir).length; } catch { /* vault may not exist */ }
      const sessions = getActiveSessions(dir);

      console.log('AgentVault Status');
      console.log(`   Profiles: ${profiles.length} (${profiles.join(', ')})`);
      console.log(`   Secrets:  ${secretCount} stored`);
      console.log(`   Sessions: ${sessions.length} active`);

      if (sessions.length) {
        console.log('');
        for (const s of sessions) {
          console.log(`   ${s.id.slice(0, 8)} | agent: ${s.agentId} | profile: ${s.profileName} | since: ${s.startedAt}`);
        }
      }
    });
}
