import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import { loadMemories } from '../memory/memory.js';
import { getPassphrase, writeEncryptedFile } from '../vault/encryption.js';
export function memoryPackageCommand() {
    return new Command('package')
        .description('Package memories into a purchasable bank')
        .requiredOption('--from-tag <tag>', 'Tag to filter memories by')
        .requiredOption('--name <name>', 'Bank name')
        .requiredOption('--price <price>', 'Price identifier')
        .option('--description <desc>', 'Bank description', '')
        .option('--access-type <type>', 'License type: unlimited|time_locked|access_limited|time_and_access|subscription', 'unlimited')
        .option('--max-accesses <n>', 'Max accesses for access_limited types')
        .option('--expires-days <n>', 'Days until expiry for time_locked types')
        .action((opts) => {
        const dir = process.cwd();
        const entries = loadMemories(dir);
        const filtered = entries.filter(e => e.tags.includes(opts.fromTag));
        if (!filtered.length) {
            console.log(`No memories found with tag "${opts.fromTag}"`);
            return;
        }
        const bankDir = path.join(resolvePaths(dir).purchasedBanks, opts.name);
        fs.mkdirSync(bankDir, { recursive: true });
        // Write encrypted bank data
        const passphrase = getPassphrase(dir);
        writeEncryptedFile(path.join(bankDir, 'bank.encrypted'), filtered, passphrase);
        // Write descriptor
        const descriptor = {
            name: opts.name,
            description: opts.description,
            entryCount: filtered.length,
            tags: [opts.fromTag],
            createdAt: new Date().toISOString(),
        };
        fs.writeFileSync(path.join(bankDir, 'descriptor.json'), JSON.stringify(descriptor, null, 2));
        // Write license
        const now = new Date();
        const license = {
            name: opts.name,
            accessType: opts.accessType,
            issuedAt: now.toISOString(),
            expiresAt: opts.expiresDays
                ? new Date(now.getTime() + parseInt(opts.expiresDays) * 86400000).toISOString()
                : undefined,
            remainingAccesses: opts.maxAccesses ? parseInt(opts.maxAccesses) : undefined,
            maxAccesses: opts.maxAccesses ? parseInt(opts.maxAccesses) : undefined,
        };
        fs.writeFileSync(path.join(bankDir, 'license.json'), JSON.stringify(license, null, 2));
        console.log(`Bank "${opts.name}" packaged: ${filtered.length} entries from tag "${opts.fromTag}"`);
        console.log(`  Location: ${bankDir}`);
        console.log(`  Access type: ${opts.accessType}`);
    });
}
//# sourceMappingURL=memoryPackage.js.map