import { Command } from 'commander';
import fs from 'node:fs';
import { exportPortable, importPortable } from '../portable/portable.js';
import { addSecret, loadVault } from '../vault/vault.js';
import { storeMemory, loadMemories } from '../memory/memory.js';
export function vaultCommand() {
    const cmd = new Command('vault').description('Vault export/import operations');
    cmd.command('export <output>')
        .description('Export vault to portable .avault file')
        .requiredOption('--passphrase <passphrase>', 'Passphrase for the exported file')
        .option('--include-memories', 'Include memory entries', true)
        .option('--decrypted', 'Export as plaintext JSON (requires --confirm-plaintext)')
        .option('--confirm-plaintext', 'Confirm plaintext export')
        .action((output, opts) => {
        if (opts.decrypted) {
            if (!opts.confirmPlaintext) {
                console.error('Plaintext export requires --confirm-plaintext flag');
                process.exit(1);
            }
            const entries = loadVault(process.cwd());
            const memories = opts.includeMemories ? loadMemories(process.cwd()) : [];
            const data = JSON.stringify({ entries, memories }, null, 2);
            fs.writeFileSync(output, data, { mode: 0o600 });
            console.log(`Exported plaintext to ${output} (permissions: 0600)`);
            return;
        }
        exportPortable(process.cwd(), output, opts.passphrase, {
            includeMemories: opts.includeMemories,
        });
        console.log(`Exported vault to ${output}`);
    });
    cmd.command('import <input>')
        .description('Import from a portable .avault file')
        .requiredOption('--passphrase <passphrase>', 'Passphrase for the imported file')
        .option('--merge', 'Merge with existing entries (default: skip existing keys)')
        .action(async (input, opts) => {
        const portable = importPortable(input, opts.passphrase);
        let secretCount = 0;
        let memoryCount = 0;
        for (const entry of portable.entries) {
            addSecret(process.cwd(), entry.key, entry.value);
            secretCount++;
        }
        for (const mem of portable.memories) {
            await storeMemory(process.cwd(), {
                key: mem.key,
                content: mem.content,
                memoryType: mem.memoryType,
                tags: mem.tags,
                confidence: mem.confidence,
                source: mem.source,
            });
            memoryCount++;
        }
        console.log(`Imported ${secretCount} secret(s) and ${memoryCount} memory/memories from ${input}`);
    });
    return cmd;
}
//# sourceMappingURL=vault.js.map