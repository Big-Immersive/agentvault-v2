import { Command } from 'commander';
import fs from 'node:fs';
import { addSecret, getSecret, removeSecret, listSecretKeys } from '../vault/vault.js';
export function secretCommand() {
    const cmd = new Command('secret').description('Manage vault secrets');
    cmd.command('add <key> <value>')
        .description('Add or update a secret in the vault')
        .action((key, value) => {
        addSecret(process.cwd(), key, value);
        console.log(`Secret "${key}" stored`);
    });
    cmd.command('get <key>')
        .description('Retrieve a secret from the vault')
        .action((key) => {
        const value = getSecret(process.cwd(), key);
        if (value === undefined) {
            console.log(`Secret "${key}" not found.`);
            return;
        }
        console.log(value);
    });
    cmd.command('remove <key>')
        .description('Remove a secret from the vault')
        .option('--dry-run', 'Preview without removing')
        .action((key, opts) => {
        if (opts.dryRun) {
            const value = getSecret(process.cwd(), key);
            if (value === undefined) {
                console.log(`Secret "${key}" not found.`);
                return;
            }
            console.log(`[DRY RUN] Would remove secret "${key}"`);
            return;
        }
        const removed = removeSecret(process.cwd(), key);
        if (removed)
            console.log(`Secret "${key}" removed`);
        else
            console.log(`Secret "${key}" not found.`);
    });
    cmd.command('list')
        .description('List secret keys (values hidden)')
        .action(() => {
        const keys = listSecretKeys(process.cwd());
        if (!keys.length) {
            console.log('No secrets stored.');
            return;
        }
        for (const k of keys)
            console.log(`  ${k}`);
    });
    cmd.command('import <file>')
        .description('Import secrets from a .env file')
        .action((file) => {
        if (!fs.existsSync(file)) {
            console.log(`File not found: ${file}`);
            return;
        }
        const content = fs.readFileSync(file, 'utf-8');
        let count = 0;
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx < 0)
                continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            addSecret(process.cwd(), key, value);
            count++;
        }
        console.log(`Imported ${count} secret(s) from ${file}`);
    });
    return cmd;
}
//# sourceMappingURL=secret.js.map