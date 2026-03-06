import { Command } from 'commander';
import fs from 'node:fs';
import readline from 'node:readline';
import { resolvePaths } from '../config/paths.js';
import { loadVault, saveVault } from '../vault/vault.js';
import { loadMemories, saveMemories } from '../memory/memory.js';
import { _clearPassphraseCache } from '../vault/encryption.js';

function askQuestion(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function rotateCommand(): Command {
  return new Command('rotate')
    .description('Rotate the vault encryption passphrase')
    .option('--dry-run', 'Preview without rotating')
    .action(async (opts) => {
      const dir = process.cwd();
      const paths = resolvePaths(dir);

      if (!fs.existsSync(paths.base)) {
        console.log('AgentVault not initialized. Run `agentvault init` first.');
        return;
      }

      // Load secrets and memories with current passphrase
      let vaultEntries;
      let memoryEntries;
      try {
        vaultEntries = loadVault(dir);
        memoryEntries = loadMemories(dir);
      } catch {
        console.log('Failed to decrypt vault with current passphrase.');
        return;
      }

      console.log(`\nVault contains ${vaultEntries.length} secret(s) and ${memoryEntries.length} memory entries.`);

      if (opts.dryRun) {
        console.log('[DRY RUN] Would rotate passphrase and re-encrypt all data.');
        return;
      }

      console.log('Enter a new passphrase to re-encrypt.\n');

      let newPassphrase = await askQuestion('  New passphrase (min 8 chars): ');
      while (newPassphrase.length < 8) {
        console.log('  Passphrase must be at least 8 characters.');
        newPassphrase = await askQuestion('  New passphrase (min 8 chars): ');
      }

      const confirm = await askQuestion('  Confirm passphrase: ');
      if (newPassphrase !== confirm) {
        console.log('\nPassphrases do not match. Aborted.\n');
        return;
      }

      // Write new passphrase, clear cache, then re-encrypt
      fs.writeFileSync(paths.passphrase, newPassphrase, { mode: 0o600 });
      _clearPassphraseCache();

      saveVault(dir, vaultEntries);
      if (memoryEntries.length > 0) {
        saveMemories(dir, memoryEntries);
      }

      console.log('\nPassphrase rotated. Vault and memories re-encrypted.\n');
    });
}
